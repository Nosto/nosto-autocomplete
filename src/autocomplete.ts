import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { search } from './utils/api'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'

export function autocomplete(config: AutocompleteConfig): {
    destroy(): void
    open(): void
    close(): void
} {
    const configWithDefaults = { ...defaultConfig, ...config }

    const dropdowns = findAll(
        configWithDefaults.inputSelector,
        HTMLInputElement,
    ).map((inputElement) => {
        const dropdownElements =
            typeof configWithDefaults.dropdownSelector === 'function'
                ? findAll(
                      configWithDefaults.dropdownSelector(inputElement),
                      HTMLElement,
                  )
                : findAll(configWithDefaults.dropdownSelector, HTMLElement)

        if (dropdownElements.length === 0) {
            console.error(`No dropdown element found for input ${inputElement}`)
            return
        } else if (dropdownElements.length > 1) {
            console.error(
                `Multiple dropdown elements found for input ${inputElement}, using the first element`,
            )
        }

        const dropdownElement = dropdownElements[0]
        const dropdown = new Dropdown(dropdownElement, config.render)

        let lastRenderTime = Date.now()

        const input = bindInput(inputElement, {
            onInput: (value) => {
                if (
                    !configWithDefaults.minQueryLength ||
                    value.length < configWithDefaults.minQueryLength
                ) {
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
    })

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
