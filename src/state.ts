import { InputSearchQuery, SearchResult } from './api/search/generated'

import { AutocompleteConfig } from '.'
import { defaultConfig } from './config'
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

export const initState = <T extends State>(
    config: AutocompleteConfig<T>,
    options?: {
        history?: History
        minQueryLength?: number
    },
) => {
    let cancellable: Cancellable<T> | undefined

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
        getState: (inputValue?: string): PromiseLike<T> => {
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
                }).then((s) => s as T)
            }

            return (
                cancellable?.promise ??
                AnyPromise.resolve({}).then((s) => s as T)
            )
        },
    }
}
