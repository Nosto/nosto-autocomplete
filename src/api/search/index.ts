import { InputSearchQuery } from "./generated"

/**
 * @group Nosto Client
 * @category Search Types
 */
export interface InputSearchQueryWithFields extends InputSearchQuery {
    products?: {
        /**
         * The fields to return in the response.
         */
        fields?: string[]
    } & InputSearchQuery["products"]
    keywords?: {
        /**
         * The fields to return in the response.
         */
        fields?: string[]
    } & InputSearchQuery["keywords"]
}

/**
 * @group Nosto Client
 * @category Core
 */
export interface SearchOptions {
    /**
     * Enabled Nosto tracking. The source of search request must be provided, e.g. if request made from autocomplete, track should be set to "autocomplete".
     */
    track?: "autocomplete" | "category" | "serp"
    /**
     * Automatically handle redirect when received from search.
     */
    redirect?: boolean
    /**
     * Marks that search was done by clicking a keyword
     */
    isKeyword?: boolean
}

export * from "./generated"
