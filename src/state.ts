import { SearchQuery, SearchResponse } from './utils/api'

export interface State {
    /**
     * The current search query
     */
    query?: SearchQuery
    /**
     * The current search response
     */
    response?: SearchResponse
}
