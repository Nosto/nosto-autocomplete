import { InputSearchQuery, SearchResult } from './api/search/generated'

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
