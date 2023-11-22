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

export * from "./generated"
