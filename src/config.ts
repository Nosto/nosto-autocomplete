import type { SearchQuery } from "@nosto/nosto-js/client"
import { SearchAutocompleteOptions } from "./autocomplete"
import { search } from "./search"
import { HitDecorator } from "./search-js"

/**
 * @group Autocomplete
 * @category Core
 */
export interface GoogleAnalyticsConfig {
  /**
   * Path of search page
   * @default "/search"
   */
  serpPath?: string
  /**
   * Search query url parameter name
   * @default "query"
   */
  queryParamName?: string
  /**
   * Enable Google Analytics
   * @default true
   */
  enabled?: boolean
}

type Selector = string | Element

/**
 * @group Autocomplete
 * @category Core
 */
export interface AutocompleteConfig<State> {
  /**
   * The input element to attach the autocomplete to
   */
  inputSelector: Selector
  /**
   * The dropdown element to attach the autocomplete to
   */
  dropdownSelector: Selector | ((input: HTMLInputElement) => Selector)
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
  fetch: SearchQuery | ((input: string) => PromiseLike<State>)
  /**
   * The function to use to submit the search
   */
  submit?: (
    query: string,
    config: AutocompleteConfig<State>,
    options?: SearchAutocompleteOptions
  ) => void
  /**
   * Enable history
   */
  historyEnabled?: boolean
  /**
   * Max number of history items to show
   */
  historySize?: number
  /**
   * Enable Nosto Analytics
   */
  nostoAnalytics?: boolean
  /**
   * Google Analytics configuration. Set to `false` to disable.
   */
  googleAnalytics?: GoogleAnalyticsConfig | boolean
  /**
   * Decorate each search hit before rendering
   */
  hitDecorators?: HitDecorator[]
}

export const defaultGaConfig = {
  serpPath: "/search",
  queryParamName: "query",
  enabled: true,
}

export function getDefaultConfig<State>() {
  return {
    minQueryLength: 2,
    historyEnabled: true,
    historySize: 5,
    hitDecorators: [],
    nostoAnalytics: true,
    googleAnalytics: defaultGaConfig,
    submit: (query, config, options) => {
      if (
        query.length >=
        (config.minQueryLength ?? getDefaultConfig<State>().minQueryLength)
      ) {
        search(
          {
            query,
          },
          {
            redirect: true,
            track: config.nostoAnalytics ? "serp" : undefined,
            hitDecorators: config.hitDecorators,
            ...options,
          }
        )
      }
    },
  } satisfies Partial<AutocompleteConfig<State>>
}
