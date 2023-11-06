import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { DefaultState, StateActions, getStateActions } from './state'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'
import { History } from './history'
import { Limiter, LimiterError } from './utils/limiter'

/**
 * @group Autocomplete
 * @category Core
 */
export function autocomplete<State = DefaultState>(
    config: AutocompleteConfig<State>,
): {
    destroy(): void
    open(): void
    close(): void
} {
    const minQueryLength = config.minQueryLength ?? defaultConfig.minQueryLength
    const historyEnabled = config.historyEnabled ?? defaultConfig.historyEnabled
    const historySize = config.historySize ?? defaultConfig.historySize
    const history = historyEnabled ? new History(historySize) : undefined

    const limiter = new Limiter(300, 1)

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        (inputElement) => {
            const actions = getStateActions({
                config,
                minQueryLength,
                history,
                input: inputElement,
            })

            const dropdown = createInputDropdown({
                input: inputElement,
                config,
                actions,
            })

            if (!dropdown) {
                return
            }

            let lastRenderTime = Date.now()

            const input = bindInput(inputElement, {
                onInput: async (value) => {
                    const requestTime = Date.now()

                    try {
                        await limiter.limited(() => {
                            return actions.updateState(value).then((state) => {
                                if (requestTime >= lastRenderTime) {
                                    dropdown.update(state)
                                }
                            })
                        })
                    } catch (err) {
                        if (!(err instanceof LimiterError)) {
                            throw err
                        }
                    }
                },
                onFocus() {
                    dropdown.show()
                },
                onBlur() {
                    dropdown.hide()
                },
                onSubmit() {
                    if (historyEnabled) {
                        actions.addHistoryItem(inputElement.value)
                    }

                    if (dropdown.hasHighlight()) {
                        dropdown.handleSubmit()
                    } else {
                        if (typeof config?.submit === 'function') {
                            config.submit(inputElement.value)
                        }
                    }

                    dropdown.hide()
                },
                onSubmitButton() {
                    if (historyEnabled) {
                        actions.addHistoryItem(inputElement.value)
                    }

                    if (typeof config?.submit === 'function') {
                        config.submit(inputElement.value)
                    }

                    dropdown.hide()
                },
                onKeyDown(_, key) {
                    if (key === 'Escape') {
                        dropdown.hide()
                    } else if (key === 'ArrowDown') {
                        if (dropdown.isOpen()) {
                            dropdown.goDown()
                        } else {
                            dropdown.show()
                        }
                    } else if (key === 'ArrowUp') {
                        if (dropdown.isOpen()) {
                            dropdown.goUp()
                        }
                    }
                },
            })

            const clickOutside = bindClickOutside(
                [dropdown.container, inputElement],
                () => {
                    dropdown.hide()
                },
            )

            return {
                open() {
                    dropdown.show()
                },
                close() {
                    dropdown.hide()
                },
                destroy() {
                    input.destroy()
                    clickOutside.destroy()
                    dropdown.destroy()
                },
            }
        },
    )

    return {
        destroy() {
            dropdowns.forEach((dropdown) => dropdown?.destroy())
        },
        open() {
            dropdowns.forEach((dropdown) => dropdown?.open())
        },
        close() {
            dropdowns.forEach((dropdown) => dropdown?.close())
        },
    }
}

function createInputDropdown<State = DefaultState>({
    input,
    config,
    actions,
}: {
    input: HTMLInputElement
    config: AutocompleteConfig<State>
    actions: StateActions<State>
}): Dropdown<State> | undefined {
    const dropdownElements =
        typeof config.dropdownSelector === 'function'
            ? findAll(config.dropdownSelector(input), HTMLElement)
            : findAll(config.dropdownSelector, HTMLElement)

    if (dropdownElements.length === 0) {
        console.error(`No dropdown element found for input ${input}`)
        return
    } else if (dropdownElements.length > 1) {
        console.error(
            `Multiple dropdown elements found for input ${input}, using the first element`,
        )
    }

    const dropdownElement = dropdownElements[0]

    return new Dropdown<State>(
        dropdownElement,
        actions.updateState(input.value),
        config.render,
        config.submit,
        (value) => (input.value = value),
        {
            removeHistory: function (data) {
                if (data === 'all') {
                    return actions.clearHistory()
                } else if (data) {
                    return actions.removeHistoryItem(data)
                }
            },
        },
    )
}
