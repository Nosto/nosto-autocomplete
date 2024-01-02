import { getNostoClient } from "./api/client"
import { AutocompleteConfig, getDefaultConfig } from "./config"
import { Dropdown, createDropdown, parseHit } from "./utils/dropdown"
import { DefaultState, StateActions, getStateActions } from "./utils/state"
import { bindClickOutside, findAll } from "./utils/dom"
import { bindInput } from "./utils/input"
import { LimiterError, createLimiter } from "./utils/limiter"
import { CancellableError } from "./utils/promise"
import { getGaTrackUrl, isGaEnabled, trackGaPageView } from "./utils/ga"
import { createHistory } from "./utils/history"

export type AutocompleteInstance = {
    /**
     * Open the dropdown.
     */
    open(): void
    /**
     * Close the dropdown.
     */
    close(): void
    /**
     * Destroy the autocomplete instance.
     */
    destroy(): void
}

/**
 * @param config Autocomplete configuration.
 * @returns Autocomplete instance.
 * @group Autocomplete
 * @category Core
 * @example
 * ```js
 * import { autocomplete } from '@nosto/nosto-autocomplete';
 *
 * // Basic usage
 * autocomplete({
 *   inputSelector: '#search',
 *   dropdownSelector: '#dropdown',
 *   render: (container, state) => {
 *     container.innerHTML = `
 *        <div>
 *         <h1>${state.query}</h1>
 *        <ul>
 *        ${state.response.products
 *          .map((product) => `<li>${product.name}</li>`)
 *          .join('')}
 *       </ul>
 *     </div>
 *    `;
 *   },
 *   fetch: {
 *     products: {
 *       fields: ['name', 'url', 'imageUrl', 'price', 'listPrice', 'brand'],
 *       size: 5
 *     },
 *     keywords: {
 *       size: 5,
 *       fields: ['keyword', '_highlight.keyword'],
 *       highlight: {
 *         preTag: `<strong>`,
 *         postTag: '</strong>'
 *       }
 *     }
 *   }
 * });
 *
 * // Liquid template.
 * import { autocomplete, fromRemoteLiquidTemplate, fromLiquidTemplate, defaultLiquidTemplate } from '@nosto/nosto-autocomplete/liquid';
 *
 * autocomplete({
 *   inputSelector: '#search',
 *   dropdownSelector: '#dropdown',
 *   render: fromRemoteLiquidTemplate('autocomplete.liquid'),
 *   // Or:
 *   render: window.nostoAutocomplete.fromLiquidTemplate(defaultLiquidTemplate),
 *   fetch:
 *   ...
 * });
 *
 * // Mustache template.
 * import { autocomplete, fromRemoteMustacheTemplate, fromMustacheTemplate, defaultMustacheTemplate } from '@nosto/nosto-autocomplete/mustache';
 *
 * autocomplete({
 *   inputSelector: '#search',
 *   dropdownSelector: '#dropdown',
 *   render: fromRemoteMustacheTemplate('autocomplete.mustache'),
 *   // Or:
 *   render: fromMustacheTemplate(defaultMustacheTemplate),
 *   fetch:
 *   ...
 * });
 *
 * // React example.
 * import { autocomplete, Autocomplete } from '@nosto/nosto-autocomplete/react';
 * import ReactDOM from 'react-dom';
 *
 * let reactRoot;
 *
 * autocomplete({
 *   inputSelector: '#search',
 *   dropdownSelector: '#dropdown',
 *   render: function (container, state) {
 *     if (!reactRoot) {
 *       reactRoot = ReactDOM.createRoot(container);
 *     }
 *     reactRoot.render(<Autocomplete {...state} />);
 *   },
 *   fetch:
 *   ...
 * });
 * ```
 */
export function autocomplete<State = DefaultState>(
    config: AutocompleteConfig<State>
): AutocompleteInstance {
    const fullConfig = {
        ...getDefaultConfig<State>(),
        ...config,
    } satisfies AutocompleteConfig<State>

    const history = fullConfig.historyEnabled
        ? createHistory(fullConfig.historySize)
        : undefined

    const limiter = createLimiter(300, 1)

    const dropdowns = findAll(config.inputSelector, HTMLInputElement).map(
        inputElement => {
            const actions = getStateActions({
                config: fullConfig,
                history,
                input: inputElement,
            })

            const dropdown = createInputDropdown({
                input: inputElement,
                config: fullConfig,
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
                    submitWithContext({
                        config: fullConfig,
                        actions,
                    })(inputElement.value)
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
                            const data = dropdown.getHighlight()?.dataset?.nsHit
                            if (data) {
                                trackClick({
                                    config: fullConfig,
                                    data,
                                    query: inputElement.value,
                                })
                            }
                            dropdown.handleSubmit()
                        } else {
                            submitWithContext({
                                actions,
                                config: fullConfig,
                            })(inputElement.value)
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

function createInputDropdown<State>({
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
        submitWithContext({
            actions,
            config,
        }),
        value => (input.value = value),
        {
            removeHistory: function ({ data, update }) {
                if (data === "all") {
                    return actions.clearHistory().then(state => update(state))
                } else if (data) {
                    return actions
                        .removeHistoryItem(data)
                        .then(state => update(state))
                }
            },
            hit: function ({ data }) {
                if (data) {
                    trackClick({ config, data, query: input.value })
                }
            },
        }
    )
}

function trackClick<State>({
    config,
    data,
    query,
}: {
    config: AutocompleteConfig<State>
    data: string
    query: string
}) {
    if (!config.googleAnalytics && !config.nostoAnalytics) {
        return
    }

    const parsedHit = parseHit(data)

    if (config.nostoAnalytics) {
        if (parsedHit) {
            getNostoClient().then(api => {
                api?.recordSearchClick?.("autocomplete", parsedHit)
            })
        }
    }

    if (isGaEnabled(config)) {
        if (parsedHit._redirect) {
            trackGaPageView({
                delay: true,
                location: getGaTrackUrl(parsedHit.keyword, config),
            })
        }

        if (parsedHit.url) {
            trackGaPageView({
                delay: true,
                location: getGaTrackUrl(query, config),
            })
        }
    }
}

function submitWithContext<State>(context: {
    config: AutocompleteConfig<State>
    actions: StateActions<State>
}) {
    return (value: string, redirect: boolean = false) => {
        const { config, actions } = context

        if (value.length > 0) {
            if (config.historyEnabled) {
                actions.addHistoryItem(value)
            }

            if (config.nostoAnalytics) {
                getNostoClient().then(api => {
                    api?.recordSearchSubmit?.(value)
                })
            }

            if (isGaEnabled(config)) {
                trackGaPageView({
                    delay: true,
                    location: getGaTrackUrl(value, config),
                })
            }

            if (!redirect && typeof config?.submit === "function") {
                config.submit(value, config)
            }
        }
    }
}
