import { InputSearchQuery, SearchResult } from './api/search/generated'

import { AutocompleteConfig } from '.'
import { getNostoClient } from './api/client'
import { History } from './history'
import { AnyPromise, Cancellable, makeCancellable } from './utils/promise'

/**
 * @group Autocomplete
 * @category Core
 */
export interface State {
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

export type StateActions<T extends State> = {
    updateState(inputValue?: string): PromiseLike<T>
    addHistoryItem(item: string): PromiseLike<T>
    removeHistoryItem(item: string): PromiseLike<T>
    clearHistory(): PromiseLike<T>
}

export const getStateActions = <T extends State>({
    config,
    history,
    input,
    minQueryLength,
}: {
    config: AutocompleteConfig<T>
    history?: History
    input: HTMLInputElement
    minQueryLength: number
}): StateActions<T> => {
    let cancellable: Cancellable<T> | undefined

    const fetchState = (value: string, config: AutocompleteConfig<T>) => {
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
                        }) as T,
                )
        }
    }

    const getHistoryState = (query: string) => {
        return AnyPromise.resolve({
            query: {
                query,
            },
            history: history?.getItems(),
        }).then((s) => s as T)
    }

    return {
        updateState: (inputValue?: string): PromiseLike<T> => {
            cancellable?.cancel()

            if (inputValue && inputValue.length >= minQueryLength) {
                cancellable = makeCancellable(fetchState(inputValue, config))
                return cancellable.promise
            } else if (history) {
                return getHistoryState(inputValue ?? '')
            }

            return (
                cancellable?.promise ??
                AnyPromise.resolve({}).then((s) => s as T)
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
