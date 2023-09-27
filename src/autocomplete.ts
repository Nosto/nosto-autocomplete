import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { DefaultState } from './state'
import { getNostoClient } from './api/client'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'
import { History } from './history'

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

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        (inputElement) => {
            const history = historyEnabled
                ? new History(historySize)
                : undefined
            const dropdown = createInputDropdown(inputElement, config, history)

            if (!dropdown) {
                return
            }

            let lastRenderTime = Date.now()

            const input = bindInput(inputElement, {
                onInput: (value) => {
                    if (value.length >= minQueryLength) {
                        const requestTime = Date.now()

                        fetchState(value, config).then((state) => {
                            if (requestTime >= lastRenderTime) {
                                dropdown.update(state)
                            }
                        })
                    } else if (history) {
                        dropdown.update({
                            query: {
                                query: value,
                            },
                            history: history.getItems(),
                        } as State)
                    }
                },
                onFocus() {
                    dropdown.show()
                },
                onBlur() {
                    dropdown.hide()
                },
                onSubmit() {
                    dropdown.hide()

                    if (historyEnabled) {
                        history?.add(inputElement.value)
                    }

                    if (typeof config?.submit === 'function') {
                        config.submit(inputElement.value)
                    }
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
    history?: History
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
        {
            history: history?.getItems(),
        } as State,
        config.render,
        config.submit,
        (value) => (input.value = value),
    )
}

function fetchState<State>(
    value: string,
    config: AutocompleteConfig<State>,
): PromiseLike<State> {
    if (typeof config.fetch === 'function') {
        return config.fetch(value)
    } else {
        const query = {
            query: value,
            ...config.fetch,
        }
        return getNostoClient()
            .then((api) => {
                return api.search(query, {
                    track: 'autocomplete',
                })
            })
            .then(
                (response) =>
                    ({
                        query,
                        response,
                    }) as State,
            )
    }
}
