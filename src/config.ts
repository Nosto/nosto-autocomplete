import { InputSearchQueryWithFields } from './api/search'

/**
 * @group Autocomplete
 * @category Core
 */
export interface AutocompleteConfig<State> {
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
     * The function to use to render the dropdown
     */
    render: (container: HTMLElement, state: State) => void | PromiseLike<void>
    /**
     * Minimum length of the query before searching
     */
    minQueryLength?: number
    /**
     * The function to use to fetch the search state
     */
    fetch: InputSearchQueryWithFields | ((input: string) => PromiseLike<State>)
}

export const defaultConfig = {
    minQueryLength: 2,
}
