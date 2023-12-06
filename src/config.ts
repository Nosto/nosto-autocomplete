import { InputSearchQueryWithFields } from "./api/search"
import { search } from "./search"

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
              input: HTMLInputElement
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
    /**
     * The function to use to submit the search
     */
    submit: (query: string, config?: AutocompleteConfig<State>) => unknown
    /**
     * Enable history
     */
    historyEnabled?: boolean
    /**
     * Max number of history items to show
     */
    historySize?: number
    /**
     * enable Nosto Analytics
     */
    nostoAnalytics?: boolean
    /**
     * Enable Google Analytics
     *
     */
    googleAnalytics?:
        | {
              serpPath?: string
              queryParamName?: string
              enabled?: boolean
          }
        | boolean
}

export const defaultConfig = {
    minQueryLength: 2,
    historyEnabled: true,
    historySize: 5,
    nostoAnalytics: true,
    googleAnalytics: {
        serpPath: "/search",
        queryParamName: "query",
        enabled: true,
    },
    submit: (query: string, config: AutocompleteConfig<unknown>) => {
        search(
            {
                query,
            },
            {
                redirect: true,
                track: config.nostoAnalytics ? "serp" : undefined,
            }
        )
    },
}
