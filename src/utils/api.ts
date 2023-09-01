import { AnyPromise } from './promise'

export interface SearchQuery {}

export interface SearchResponse {}

export interface NostoAPI {
    search(query: SearchQuery, options: any): PromiseLike<SearchResponse>
}

export function getNosto(): PromiseLike<NostoAPI> {
    return new AnyPromise((resolve, reject) => {
        if ('nostojs' in window && typeof window.nostojs === 'function') {
            window.nostojs((api: NostoAPI) => {
                resolve(api)
            })
        } else {
            reject('nostojs not found')
        }
    })
}

export function search(query: SearchQuery): PromiseLike<SearchResponse> {
    return getNosto().then((api) => {
        return api.search(query, {
            track: 'autocomplete',
        })
    })
}
