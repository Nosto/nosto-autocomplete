import { InputSearchQuery, SearchResult } from "./api/search/generated"

import { AutocompleteConfig } from "."
import { getNostoClient } from "./api/client"
import { History } from "./history"
import { AnyPromise, Cancellable, makeCancellable } from "./utils/promise"

/**
 * @group Autocomplete
 * @category Core
 */
export interface DefaultState {
    /**
     * The current search query
     */
    query?: InputSearchQuery
    /**
     * The current search response
     */
    response?: SearchResult
    /**
     * The history items
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
    minQueryLength,
}: {
    config: AutocompleteConfig<State>
    history?: History
    input: HTMLInputElement
    minQueryLength: number
}): StateActions<State> => {
    let cancellable: Cancellable<State> | undefined

    const fetchState = (value: string, config: AutocompleteConfig<State>) => {
        if (typeof config.fetch === "function") {
            return config.fetch(value)
        } else {
            const query = {
                query: value,
                ...config.fetch,
            }
            return getNostoClient()
                .then(api => {
                    return api.search(query, {
                        track: "autocomplete",
                    })
                })
                .then(
                    response =>
                        ({
                            query,
                            response,
                        }) as State
                )
        }
    }

    const getHistoryState = (query: string) => {
        return AnyPromise.resolve({
            query: {
                query,
            },
            history: history?.getItems(),
        }).then(s => s as State)
    }

    return {
        updateState: (inputValue?: string): PromiseLike<State> => {
            cancellable?.cancel()

            if (inputValue && inputValue.length >= minQueryLength) {
                cancellable = makeCancellable(fetchState(inputValue, config))
                return cancellable.promise.then(
                    s => s as State,
                    e => {
                        throw e
                    }
                )
            } else if (history) {
                return getHistoryState(inputValue ?? "")
            }

            return (
                cancellable?.promise.then(
                    s => s as State,
                    e => {
                        throw e
                    }
                ) ?? AnyPromise.resolve({}).then(s => s as State)
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
