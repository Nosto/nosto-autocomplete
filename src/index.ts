export {
    autocomplete, type AutocompleteInstance, search, 
    type AutocompleteConfig, type GoogleAnalyticsConfig,
    type DefaultState,
    priceDecorator
  } from "./entries/base"
export {
    fromMustacheTemplate,
    fromRemoteMustacheTemplate,
    defaultMustacheTemplate
} from "./entries/mustache"
export {
    fromLiquidTemplate,
    fromRemoteLiquidTemplate,
    defaultLiquidTemplate,
} from "./entries/liquid"
export {
    Autocomplete, type AutocompleteProps
} from "./entries/react"