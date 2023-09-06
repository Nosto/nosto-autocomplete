import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { DefaultState } from './state'
import { getNostoClient } from './api/client'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'

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

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        (inputElement) => {
            const dropdown = createInputDropdown(inputElement, config)

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
                },
                onKeyDown(_, key) {
                    if (key === 'Escape') {
                        dropdown.hide()
                    } else if (key === 'ArrowDown') {
                        dropdown.show()
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
    return new Dropdown<State>(dropdownElement, config.render)
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
