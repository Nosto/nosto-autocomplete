import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
import { Dropdown } from './dropdown'
import { DefaultState } from './state'
import { getNostoClient } from './api/client'
import { bindClickOutside, findAll } from './utils/dom'
import { bindInput } from './utils/input'
import { History } from './history'
import { AnyPromise, Cancellable, makeCancellable } from './utils/promise'
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

const initState = <State>(
    config: AutocompleteConfig<State>,
    options?: {
        history?: History
        minQueryLength?: number
    },
) => {
    let cancellable: Cancellable<State> | undefined

    const { minQueryLength = defaultConfig.minQueryLength, history } =
        options ?? {}

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

    return {
        getState: (inputValue?: string): PromiseLike<State> => {
            cancellable?.cancel()

            if (inputValue && inputValue.length >= minQueryLength) {
                cancellable = makeCancellable(fetchState(inputValue, config))
                return cancellable.promise
            } else if (history) {
                return AnyPromise.resolve({
                    query: {
                        query: inputValue,
                    },
                    history: history.getItems(),
                }).then((s) => s as State)
            }

            return (
                cancellable?.promise ??
                AnyPromise.resolve({}).then((s) => s as State)
            )
        },
    }
}
