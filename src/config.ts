import type { State } from './state'
import type { SearchQuery } from './utils/api'

export interface AutocompleteConfig {
    /**
     * The input element to attach the autocomplete to
     */
    inputSelector: string | Element | Element[] | NodeListOf<Element>
    /**
     * The dropdown element to attach the autocomplete to
     */
    dropdownSelector:
        | (string | Element | Element[] | NodeListOf<Element>)
        | ((
              input: HTMLInputElement,
          ) => string | Element | Element[] | NodeListOf<Element>)
    /**
     * The query to use when searching
     */
    query: SearchQuery
    /**
     * The function to use to render the dropdown
     */
    render: (container: HTMLElement, state: State) => void | PromiseLike<void>
    /**
     * Minimum length of the query before searching
     */
    minQueryLength?: number
}

export const defaultConfig: Partial<AutocompleteConfig> = {
    minQueryLength: 2,
}
