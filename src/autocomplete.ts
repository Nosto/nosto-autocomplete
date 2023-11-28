import { AutocompleteConfig } from "."
import { defaultConfig } from "./config"
import { createDropdown, Dropdown } from "./dropdown"
import { DefaultState, StateActions, getStateActions } from "./state"
import { bindClickOutside, findAll } from "./utils/dom"
import { bindInput } from "./utils/input"
import { createHistory } from "./history"
import { createLimiter, LimiterError } from "./utils/limiter"
import { CancellableError } from "./utils/promise"

/**
 * @group Autocomplete
 * @category Core
 */
export function autocomplete<State = DefaultState>(
    config: AutocompleteConfig<State>
): {
    destroy(): void
    open(): void
    close(): void
} {
    const minQueryLength = config.minQueryLength ?? defaultConfig.minQueryLength
    const historyEnabled = config.historyEnabled ?? defaultConfig.historyEnabled
    const historySize = config.historySize ?? defaultConfig.historySize
    const history = historyEnabled ? createHistory(historySize) : undefined

    const limiter = createLimiter(300, 1)

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        inputElement => {
            const actions = getStateActions({
                config,
                minQueryLength,
                history,
                input: inputElement,
            })

            const submit = (value: string) => {
                if (historyEnabled) {
                    actions.addHistoryItem(value)
                }
                if (typeof config?.submit === "function") {
                    config.submit(value)
                }
            }

            const dropdown = createInputDropdown({
                input: inputElement,
                config: {
                    ...config,
                    submit,
                },
                actions,
            })

            if (!dropdown) {
                return
            }

            const input = bindInput(inputElement, {
                onInput: async value => {
                    try {
                        await limiter.limited(() => {
                            return actions.updateState(value).then(state => {
                                dropdown.update(state)
                            })
                        })
                    } catch (err) {
                        if (
                            !(
                                err instanceof LimiterError ||
                                err instanceof CancellableError
                            )
                        ) {
                            throw err
                        }
                    }
                },
                onClick() {
                    dropdown.resetHighlight()
                },
                onFocus() {
                    dropdown.show()
                },
                onBlur() {
                    dropdown.hide()
                },
                onSubmit() {
                    submit(inputElement.value)
                    dropdown.hide()
                },
                onKeyDown(_, key) {
                    if (key === "Escape") {
                        dropdown.hide()
                    } else if (key === "ArrowDown") {
                        if (dropdown.isOpen()) {
                            dropdown.goDown()
                        } else {
                            dropdown.show()
                        }
                    } else if (key === "ArrowUp") {
                        if (dropdown.isOpen()) {
                            dropdown.goUp()
                        }
                    } else if (key === "Enter") {
                        if (dropdown.isOpen() && dropdown.hasHighlight()) {
                            dropdown.handleSubmit()
                        } else {
                            submit(inputElement.value)
                        }
                    }
                },
            })

            const clickOutside = bindClickOutside(
                [dropdown.container, inputElement],
                () => {
                    dropdown.hide()
                }
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
        }
    )

    return {
        destroy() {
            dropdowns.forEach(dropdown => dropdown?.destroy())
        },
        open() {
            dropdowns.forEach(dropdown => dropdown?.open())
        },
        close() {
            dropdowns.forEach(dropdown => dropdown?.close())
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
        typeof config.dropdownSelector === "function"
            ? findAll(config.dropdownSelector(input), HTMLElement)
            : findAll(config.dropdownSelector, HTMLElement)

    if (dropdownElements.length === 0) {
        console.error(`No dropdown element found for input ${input}`)
        return
    } else if (dropdownElements.length > 1) {
        console.error(
            `Multiple dropdown elements found for input ${input}, using the first element`
        )
    }

    const dropdownElement = dropdownElements[0]

    return createDropdown<State>(
        dropdownElement,
        actions.updateState(input.value).then(
            state => state,
            () => ({}) as State
        ),
        config.render,
        config.submit,
        value => (input.value = value),
        {
            removeHistory: function (data) {
                if (data === "all") {
                    return actions.clearHistory()
                } else if (data) {
                    return actions.removeHistoryItem(data)
                }
            },
        }
    )
}
