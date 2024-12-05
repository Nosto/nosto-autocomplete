import { AutocompleteConfig } from "../config"
import { History } from "./history"
import { Cancellable, makeCancellable } from "./promise"
import { search } from "../search"
import { SearchAutocompleteOptions } from "../autocomplete"
import type { InputSearchQuery, SearchResult } from "@nosto/nosto-js/client"

/**
 * @group Autocomplete
 * @category Core
 */
export interface DefaultState {
    /**
     * The current search query object.
     */
    query?: InputSearchQuery
    /**
     * The current search response.
     */
    response?: SearchResult
    /**
     * The history items.
     */
    history?: { item: string }[]
}

export type StateActions<State> = {
    updateState(inputValue?: string): PromiseLike<State>
    addHistoryItem(item: string): PromiseLike<State>
    removeHistoryItem(item: string): PromiseLike<State>
    clearHistory(): PromiseLike<State>
}

export const getStateActions = <State>({
    config,
    history,
    input,
}: {
    config: Required<AutocompleteConfig<State>>
    history?: History
    input: HTMLInputElement
}): StateActions<State> => {
    let cancellable: Cancellable<State> | undefined

    const fetchState = (
        value: string,
        config: AutocompleteConfig<State>,
        options?: SearchAutocompleteOptions
    ): PromiseLike<State> => {
        if (typeof config.fetch === "function") {
            return config.fetch(value)
        } else {
            // @ts-expect-error type mismatch
            return search(
                {
                    query: value,
                    ...config.fetch,
                },
                {
                    track: (config.nostoAnalytics ? "autocomplete" : undefined)!,
                    redirect: false,
                    ...options,
                }
            )
        }
    }

    function getHistoryState(query: string): PromiseLike<State> {
        // @ts-expect-error type mismatch
        return Promise.resolve({
            query: {
                query,
            },
            history: history?.getItems(),
        })
    }

    return {
        updateState: (inputValue?: string, options?: SearchAutocompleteOptions): PromiseLike<State> => {
            cancellable?.cancel()

            if (inputValue && inputValue.length >= config.minQueryLength) {
                cancellable = makeCancellable(fetchState(inputValue, config, options))
                return cancellable.promise
            } else if (history) {
                return getHistoryState(inputValue ?? "")
            }

            return (
                // @ts-expect-error type mismatch
                cancellable?.promise ?? Promise.resolve<State>({})
            )
        },
        addHistoryItem: (item: string) => {
            if (history) {
                history.add(item)
            }
            return getHistoryState(input.value)
        },
        removeHistoryItem: (item: string) => {
            if (history) {
                history.remove(item)
            }
            return getHistoryState(input.value)
        },
        clearHistory: () => {
            if (history) {
                history.clear()
            }
            return getHistoryState(input.value)
        },
    }
}
