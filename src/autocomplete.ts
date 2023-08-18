import { Dropdown } from './dropdown'
import { State } from './state'
import { SearchQuery, search } from './utils/api'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'

export interface AutocompleteConfig {
    /**
     * The input element to attach the autocomplete to
     */
    inputSelector: string | Element | Element[] | NodeListOf<Element>
    /**
     * The dropdown element to attach the autocomplete to
     */
    dropdownSelector: string | Element | Element[] | NodeListOf<Element>
    /**
     * The query to use when searching
     */
    query: SearchQuery
    /**
     * The function to use to render the dropdown
     */
    render: ((state: State) => string) | ((state: State) => PromiseLike<string>)
}

export function autocomplete(config: AutocompleteConfig): {
    destroy(): void
    open(): void
    close(): void
} {
    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        (inputElement) => {
            const dropdownElement = findAll(
                config.dropdownSelector,
                HTMLElement,
            )[0]!
            const dropdown = new Dropdown(dropdownElement, config.render)

            let lastRenderTime: number = Date.now()

            const input = bindInput(inputElement, {
                onInput: (value) => {
                    const requestTime = Date.now()
                    const query = { ...config.query, query: value }
                    search(query).then((response) => {
                        if (requestTime >= lastRenderTime) {
                            dropdown.update({
                                query,
                                response,
                            })
                        }
                    })
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
                [dropdownElement, inputElement],
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
            dropdowns.forEach((dropdown) => dropdown.destroy())
        },
        open() {
            dropdowns.forEach((dropdown) => dropdown.open())
        },
        close() {
            dropdowns.forEach((dropdown) => dropdown.close())
        },
    }
}