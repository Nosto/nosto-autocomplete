import { InputMaybe, InputSearchQuery } from './generated'

/**
 * @group Nosto Client
 * @category Search Types
 */
export interface InputSearchQueryWithFields extends InputSearchQuery {
    products?: InputMaybe<{
        /**
         * The fields to return in the response.
         */
        fields?: InputMaybe<string[]>
    }> &
        InputSearchQuery['products']
    keywords?: InputMaybe<{
        /**
         * The fields to return in the response.
         */
        fields?: InputMaybe<string[]>
    }> &
        InputSearchQuery['keywords']
}

export * from './generated'
