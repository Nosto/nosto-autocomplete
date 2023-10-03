import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { State, initState } from './state'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'
import { History } from './history'
import { Limiter, LimiterError } from './utils/limiter'

/**
 * @group Autocomplete
 * @category Core
 */
export function autocomplete<T extends State>(
    config: AutocompleteConfig<T>,
): {
    destroy(): void
    open(): void
    close(): void
} {
    const minQueryLength = config.minQueryLength ?? defaultConfig.minQueryLength
    const historyEnabled = config.historyEnabled ?? defaultConfig.historyEnabled
    const historySize = config.historySize ?? defaultConfig.historySize
    const history = historyEnabled ? new History(historySize) : undefined
    const state = initState(config, { minQueryLength, history })

    const limiter = new Limiter(300, 1)

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        (inputElement) => {
            const dropdown = createInputDropdown(
                inputElement,
                config,
                state.getState(inputElement.value),
            )

            if (!dropdown) {
                return
            }

            let lastRenderTime = Date.now()

            const input = bindInput(inputElement, {
                onInput: async (value) => {
                    const requestTime = Date.now()

                    try {
                        await limiter.limited(() => {
                            return state.getState(value).then((state) => {
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
                        history?.add(inputElement.value)
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

function createInputDropdown<State>(
    input: HTMLInputElement,
    config: AutocompleteConfig<State>,
    initialState: PromiseLike<State>,
): Dropdown<State> | undefined {
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
        initialState,
        config.render,
        config.submit,
        (value) => (input.value = value),
    )
}
