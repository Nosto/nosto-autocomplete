/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  Json: { input: unknown; output: unknown }
}

/**
 *
 *
 * Boost products that match the provided filter.
 * Parameter groups are sent based on match type that you are using.
 *
 * Numeric field match - boosts products based on numeric value stored.
 * Example - boost products with higher price:
 * ```
 * {
 *  "field": "price",
 *  "weight": 0.1
 * }
 * ```
 *
 * Other boost matches use filter format. Send filter parameters together with `weight` param, to boost matched products.
 * Check `InputSearchFilter` type for more info on filter format.
 *
 * Example - use value filter to match `red` products and boost their score by 2:
 * ```
 * {
 *  "field": "customFields.color",
 *  "value": [ "red" ],
 *  "weight": 2
 * }
 * ```
 *
 *
 */
export interface InputSearchBoost {
  /** Joins nested filters with logical AND */
  all?: InputSearchFilter[]
  /** Joins nested filters with logical OR */
  any?: InputSearchFilter[]
  /** Product field to apply filter on */
  field?: string
  /**
   *
   * If `true`, matches all products which have the value on selected field.
   * If `false`, matches all products which have no value in selected field.
   *
   */
  hasValue?: boolean
  /** Joins nested filters with logical AND and inverts match */
  not?: InputSearchFilter[]
  /** List of prefixes to match */
  prefix?: string[]
  /** List of range filters to apply */
  range?: InputSearchRangeFilter[]
  /** List of values to filter by, joined by OR operator */
  value?: string[]
  /** boost weight */
  weight: number
}

/**
 *
 *
 * Add custom facets that are not configured in dashboard.
 *
 * There are 2 types of facets - `stats` and `terms`
 *
 * Terms facet is used to get all values for a field with their counts.
 * Example - get all available colors
 * ```
 * {
 *   "type": "terms",
 *   "field": "customFields.item_color",
 *   "order": "index",
 *   "name": "Color"
 * }
 * ```
 *
 * Stats facet is used to calculate min and max values for a numeric field.
 * Example - calculate price range of products
 * ```
 * {
 *   "id": "facet-id",
 *   "field": "price",
 *   "name": "Price",
 *   "type": "stats"
 * }
 * ```
 *
 *
 */
export interface InputSearchFacetConfig {
  /** If facet is disabled, it won't be calculated. Used to disable facets created in dashboard */
  enabled?: boolean
  /** Field on which facet will be calculated */
  field?: string
  /** Facet ID */
  id: string
  /** Adds a infix filter on facet's terms. Only applies if type is `terms`. Cannot be combined with prefix */
  infix?: string[]
  /** This name is returned with search response. Used as a display name in frontend */
  name?: string
  /** Returned facet order. Only applies if type is `terms` */
  order?: SearchFacetOrder
  /** Returned facet position in search response facets array */
  position?: number
  /** Adds a prefix filter on facet's terms. Only applies if type is `terms`. Cannot be combined with infix */
  prefix?: string[]
  /** How many facet terms to return. Only applies if type is `terms` */
  size?: number
  /** Facet type */
  type?: SearchFacetType
}

/**
 *
 *
 * Filters out products that don't match this filter.
 * Parameters groups are sent based on match type that you are using.
 * Only send parameters which belong to the filter type you are using.
 *
 * Exists match - matches products that have the provided field.
 * Example - match only products which are on sale
 * ```
 * {
 *  "field": "customFields.on-sale",
 *  "hasValue": true
 * }
 * ```
 *
 * Prefix match - matches products that have one of provided prefixes.
 * This match type should only be used for debugging.
 * Example - match `green` and `greenish` color
 * ```
 * {
 *  "field": "customFields.color",
 *  "prefix": [ "green" ]
 * }
 * ```
 *
 * Value match - matches products if they match any of provided values.
 * Example - match products which are red:
 * ```
 * {
 *  "field": "customFields.color",
 *  "value": [ "red" ]
 * }
 * ```
 *
 * Range match - matches products if value is in the specified range.
 * Example - match products with price 10 <= price < 100
 * ```
 * {
 *  "field": "price",
 *  "range": [
 *    {
 *      "gte": "10",
 *      "lt": "100"
 *    }
 *  ]
 * }
 * ```
 *
 * Logical match - matches products if nested filters satisfy the condition.
 *
 * Example - match samsung and apple products:
 * ```
 * {
 *   "any": [ // logical OR
 *     {
 *       "field": "brand",
 *       "value": [ "apple" ]
 *     },
 *     {
 *       "field": "brand",
 *       "value": [ "samsung" ]
 *     }
 *   ]
 * }
 *
 * // this is the same as using value match with multiple values
 *
 * {
 *   "field": "brand",
 *   "value": [ "apple", "samsung" ]
 * }
 * ```
 *
 * Example - match samsung or apple phones:
 * ```
 * {
 *   "all": [ // logical AND
 *     {
 *       "field": "brand",
 *       "value": [ "apple", "samsung" ]
 *     },
 *     {
 *       "field": "customFields.item-type",
 *       "value": [ "phone" ]
 *     }
 *   ]
 * }
 * ```
 *
 * Example - match non apple products:
 * ```
 * {
 *   "not": [ // logical NOT
 *     {
 *       "field": "brand",
 *       "value": [ "apple" ]
 *     }
 *   ]
 * }
 * ```
 *
 * Logical filters can have any filter type in their nested array.
 * That means that logical filters can nest other logical filters.
 * Example - match all apple or samsung products, which cost more than a 100 or are bestsellers
 * ```
 * {
 *   "all": [
 *     {
 *       "field": "brand",
 *       "value": [ "apple" ]
 *     },
 *     {
 *       "any": [
 *         {
 *           "field": "price",
 *           "range": {
 *             "gt": "100"
 *           }
 *         },
 *         {
 *           "field": "customFields.best-seller",
 *           "hasValue": true
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 *
 */
export interface InputSearchFilter {
  /** Joins nested filters with logical AND */
  all?: InputSearchFilter[]
  /** Joins nested filters with logical OR */
  any?: InputSearchFilter[]
  /** Product field to apply filter on */
  field?: string
  /**
   *
   * If `true`, matches all products which have the value on selected field.
   * If `false`, matches all products which have no value in selected field.
   *
   */
  hasValue?: boolean
  /** Joins nested filters with logical AND and inverts match */
  not?: InputSearchFilter[]
  /** List of prefixes to match */
  prefix?: string[]
  /** List of range filters to apply */
  range?: InputSearchRangeFilter[]
  /** List of values to filter by, joined by OR operator */
  value?: string[]
}

/**
 *
 * Provide tags for highlighting keyword results
 *
 * For example if you want to highlight results with <mark> and </mark> tags, you should provide:
 * ```
 * {
 *   "preTag": "<mark>",
 *   "postTag": "</mark>"
 * }
 * ```
 *
 * which will result in:
 * ```
 * <mark>highlighted keyword</mark> rest of the text
 * ```
 *
 *
 */
export interface InputSearchHighlight {
  postTag: string
  preTag: string
}

export interface InputSearchKeywords {
  /** List of custom boosts */
  boost?: InputSearchBoost[]
  /** Matches all objects if query is not provided or empty. Defaults to false. */
  emptyQueryMatchesAll?: boolean
  /** List of filters. Values are joined with AND operator */
  filter?: InputSearchTopLevelFilter[]
  /** Offset of returned keyword list. Used for pagination, use together with `size` parameter */
  from?: number
  /** Highlight tag */
  highlight?: InputSearchHighlight
  /** How many keywords will be returned */
  size?: number
  /** Sets how results should be sorted. After sorting by all the options provided in sort param, or in case sort param is not set, results will be sorted by relevance.  */
  sort?: InputSearchSort[]
}

/**
 *
 *
 * Used to change positions of returned products.
 * Pinning rearranges returned product positions, which means that if product is not returned with search results, it won't be pinned.
 *
 *
 */
export interface InputSearchPin {
  /** Which product field will be used to match value on. If not provided, `productId` is used */
  field?: string
  /** Where the pinned product will appear on the search page. Starts from 1 */
  position: number
  /** If product field matches any of the provided values, pin will be applied. Currently, only exact match of values is supported */
  value: string[]
}

export interface InputSearchProducts {
  /** List of custom boosts */
  boost?: InputSearchBoost[]
  /** Provide category id if search engine is used to get results for category pages. provide either `categoryId` or `categoryPath`, don't use both */
  categoryId?: string
  /** Provide category path if search engine is used to get results for category pages. provide either `categoryId` or `categoryPath`, don't use both */
  categoryPath?: string
  /** Returns only one result for each unique value for provided field. Can be used to group product variations (e.g. different colors) */
  collapse?: string
  /** Enables to add or modify facet configuration on query time. If facet with the same ID is present in the dashboard configuration, their parameters will be merged. In that case, only partial facet parameters can be provided. If facet is not present in the configuration, all required params must be present. */
  customFacets?: InputSearchFacetConfig[]
  /** Matches all objects if query is not provided or empty. Defaults to true if no name provided, false for serp and autocomplete */
  emptyQueryMatchesAll?: boolean
  /** `(Private key only)` Overwrite default exclusions behavior */
  exclusionBehaviour?: SearchExclusionBehaviour
  /** List of facet ID's, the ones configured in the dashboard, to be counted. The search engine will automatically filter out irrelevant facets depending on search queries, so not all facets listed here may be returned. `*` selects all facets */
  facets?: string[]
  /** List of filters. Values are joined with AND operator */
  filter?: InputSearchTopLevelFilter[]
  /** Offset of returned product list. Used for pagination, use together with `size` parameter */
  from?: number
  /** `(Private key only)` Overwrite default out of stock behavior */
  outOfStockBehaviour?: SearchOutOfStockBehaviour
  /** Used to provide brand, category, and other affinities from Nosto personalization frontend script. These will be different for each user */
  personalizationBoost?: InputSearchBoost[]
  /** Personalization impact in comparison to relevance and other boosts */
  personalizationWeight?: number
  /** Used to change positions of returned products. Pinning rearranges returned product positions, which means that if product is not returned with search results, it won't be pinned */
  pin?: InputSearchPin[]
  /** Same format as filter, but is always applied before counting facets. `excludeFacets` param is not allowed */
  preFilter?: InputSearchFilter[]
  /**
   * Queries data only from searchable fields with specified priorities. Use [ `high`, `medium`, `low` ] for serp.
   * Use [ `high`, `medium` ] for autocomplete
   */
  queryFields?: SearchQueryField[]
  /** How much weight has relevance in comparison to other scores (e.g. boost) */
  relevanceWeight?: number
  /** `(Private key only)` Allow private fields to be returned in search results and used in query parameters */
  showPrivateFields?: boolean
  /** How many products will be returned */
  size?: number
  /** Sets how results should be sorted. After sorting by all the options provided in sort param, or in case sort param is not set, results will be sorted by relevance. For example, if you set sort by availability status, products with the same availability status will be sorted by relevance. */
  sort?: InputSearchSort[]
  /** Selects product variation or currency */
  variationId?: string
}

export interface InputSearchQuery {
  /** Your account ID */
  accountId?: string
  /** Any custom rules that should be added in this search request. These rules are appended to the rule list defined in nosto dashboard */
  customRules?: InputSearchRule[]
  /** `(Private key only)` Returns scoring information for each object if true. This should only be used for debugging as performance will suffer. If not needed, omit this parameter */
  explain?: boolean
  /** Keyword specific parameters */
  keywords?: InputSearchKeywords
  /** Product specific parameters */
  products?: InputSearchProducts
  /** Search text (raw user input) */
  query?: string
  redirect?: string
  /** List of rule ID's or ID matching patterns with wildcards. Patterns [ `global-*`, `query-*` ] should be used here to match all rules created in dashboard */
  rules?: string[]
  /** Segment ID's user belongs to */
  segments?: string[]
  sessionParams?: InputSearchQuery
  /** `(Private key only)` Overwrites current time. Used to trigger scheduled rules ahead of schedule */
  time?: number
}

/**
 *
 *
 * Range filter - provide different parameter combinations to define type of ranges.
 * All parameters accept stringified float numbers.
 *
 * Fully bounded range example: 10 < range < 100
 * ```
 * {
 *   "gt": "10",
 *   "lt": "100"
 * }
 * ```
 *
 * Upper bounded range example: range < 100
 * ```
 * {
 *   "lt": 100
 * }
 * ```
 *
 * Lower bounded range example: range => 10
 * ```
 * {
 *   "gte": 10
 * }
 * ```
 *
 *
 */
export interface InputSearchRangeFilter {
  /** Greater than */
  gt?: string
  /** Greater than or equals */
  gte?: string
  /** Lower than */
  lt?: string
  /** Lower than or equals */
  lte?: string
}

/** Rules allow search query modification based on search parameters */
export interface InputSearchRule {
  /** Used to disable rules creating through dashboard */
  enabled?: boolean
  id: string
  /** Condition that must be met for query to match */
  match?: InputSearchRuleMatch
  /** User friendly name */
  name?: string
  /** Defines when the rule will be applied based on date/time */
  schedule?: InputSearchSchedule[]
  /** Search query parameters that will be set if rule matches. Same format as search query itself but not all params are allowed */
  set?: InputSearchQuery
}

/**
 *
 *
 * Rule match specifies when the rule will be applied.
 * Parameters groups are sent based on match type that you are using.
 * Only send parameters which belong to the filter type you are using.
 *
 * Everything match - matches every time. Used for global rules that should be applied on every request
 * Example:
 * ```
 * {
 *   "everything": true
 * }
 * ```
 *
 * Param match - extracts value from specified search request param and compares it to expected value.
 * If param value matches expected value, the rule is applied.
 * Values are preprocessed before comparing them (lowercased, phrases split into tokens, etc.).
 * Both input values and expected values are preprocessed using the same logic before comparison.
 * At least one item from expected value array must match for the rule to match as a whole.
 *
 * Example - apply rule when user searches for `battery`
 * ```
 * // user's search request
 * {
 *   "query": "battery",
 *   ...
 * }
 *
 * // rule
 * {
 *   "param": "query",
 *   "value": ["battery"]
 * }
 * ```
 *
 * In this case, no function was used, so values were processed minimally and exact match was applied.
 * You can change this behavior using one of available functions
 *
 * Param Stem match - used when you want to use exact match but you want to match different variations of the word.
 * In the previous example, rule would match with search query `battery`, but will not with `batteries`.
 * To solve his, provide stem match function:
 * ```
 * {
 *   "param": "query",
 *   "value": ["battery"],
 *   "function": "stemmed"
 * }
 * ```
 *
 * Param Contains match - used if you care about terms appearing in search query but don't care about order.
 * Values are processed in the same way as if no function was provided. Matching is done using contains match.
 * If you have a rule:
 * ```
 * {
 *   "param": "query",
 *   "value": ["battery"],
 *   "function": "contains"
 * }
 * ```
 * It will match with search query `battery`, `A4 battery`, `Li-ion battery`, etc.
 *
 *
 * Param Stemmed Contains match - values are stemmed and applies a contains match.
 * With rule:
 * ```
 * {
 *   "param": "query",
 *   "value": ["battery"],
 *   "function": "stemmedContains"
 * }
 * ```
 * You will be able to match `battery`, `batteries`, `batteries for sale`, `strong battery`, etc.
 *
 * Last type of match is logical match. It works the same way as `InputSearchFilter` logical match does.
 *
 *
 * Logical AND - Used when multiple conditions need to be met for rule to match
 * Example:
 * ```
 * {
 *   "all": [
 *     // nested match conditions
 *   ]
 * }
 * ```
 *
 * Logical AND - Used when one of the conditions need to be met for rule to match:
 * Example:
 * ```
 * {
 *   "any": [
 *     // nested match conditions
 *   ]
 * }
 * ```
 *
 * Exclude match - Used when you want to negate a match condition
 * Example:
 * ```
 * {
 *   "not": {
 *       // match condition
 *   }
 * }
 * ```
 *
 *
 */
export interface InputSearchRuleMatch {
  /** Applies logical AND to nested rule match clauses. Matches if all of them match */
  all?: InputSearchRuleMatch[]
  /** Applies logical OR to nested rule match clauses. Matches if any of them match */
  any?: InputSearchRuleMatch[]
  /** If set to `true`, rule will always match. Skip this parameter if it's not needed, does not accept `false` value. Used to create global rules in dashboard */
  everything?: boolean
  /** Expected values to be compared against. Rule matches if at least one of them matches */
  function?: SearchParamComparisonFunction
  /** Applies logical NOT to rule match clause. Matches if nested clause does not match */
  not?: InputSearchRuleMatch
  /** Param from search query from where the value will be extracted */
  param?: string
  /** Expected values to be compared against. Rule matches if at least one of them matches */
  value?: string[]
}

/** Defines when the rule will be applied based on date/time */
export interface InputSearchSchedule {
  /** Date in format `yyyy-MM-dd'T'HH:mm:ss`. Only applies if type is `ONE_TIME` */
  from?: string
  /** Format example `12:00:00`. Only applies if type is `weekly` */
  fromTime?: string
  /** Format example `Europe/Paris` */
  timezone?: string
  /** Date in format `yyyy-MM-dd'T'HH:mm:ss`. Only applies if type is `ONE_TIME` */
  to?: string
  /** Format example `16:00:00`. Only applies if type is `weekly` */
  toTime?: string
  type?: SearchRuleScheduleType
  /** Array of days to trigger the rule. Only applies if type is `weekly` */
  weekDays?: SearchRuleScheduleWeekday[]
}

/**
 *
 *
 * Sets how results should be sorted.
 * After sorting by all the options provided in sort param,
 * or in case sort param is not set, results will be sorted by relevance.
 * For example, if you set sort by availability status,
 * products with the same availability status will be sorted by relevance.
 *
 *
 */
export interface InputSearchSort {
  field: string
  order: SearchSortOrder
}

/** Same as `InputSearchFilter` type, but accepts an additional optional parameter `excludeFacets` */
export interface InputSearchTopLevelFilter {
  /** Joins nested filters with logical AND */
  all?: InputSearchFilter[]
  /** Joins nested filters with logical OR */
  any?: InputSearchFilter[]
  /** List of facet ID's to which this filter should not be applied. (default: all facets with the same field as filter if filter contains field, otherwise empty) */
  excludeFacets?: string[]
  /** Product field to apply filter on */
  field?: string
  /**
   *
   * If true, matches all products which have the value on selected field.
   * If false, matches all products which have no value in selected field.
   *
   */
  hasValue?: boolean
  /** Joins nested filters with logical AND and inverts match */
  not?: InputSearchFilter[]
  /** List of prefixes to match */
  prefix?: string[]
  /** List of range filters to apply */
  range?: InputSearchRangeFilter[]
  /** List of values to filter by, joined by OR operator */
  value?: string[]
}

/** Query search engine for search results */
export interface Query {
  search?: SearchResult
}

/** Query search engine for search results */
export interface QuerySearchArgs {
  accountId?: string
  customRules?: InputSearchRule[]
  explain?: boolean
  keywords?: InputSearchKeywords
  products?: InputSearchProducts
  query?: string
  redirect?: string
  rules?: string[]
  segments?: string[]
  sessionParams?: InputSearchQuery
  time?: number
}

export interface SearchAutocorrect {
  /** Original query value before autocorrect */
  original: string
}

/** Determines how excluded products are handled */
export type SearchExclusionBehaviour =
  /** Moves excluded products to the end of search results */
  | "deboost"
  /** Hides excluded products */
  | "hide"
  /** Does not handle excluded products in any special way */
  | "none"

/** Gives additional info on why search results are the way they are. */
export interface SearchExplain {
  /** Matched rules are returned */
  matchedRules: SearchExplainRule[]
}

export interface SearchExplainRule {
  id: string
  /** Name of the rule that matched */
  name?: string
  /** JSON object scalar, parse on frontend. Which params were set after triggering query rule */
  set?: unknown
}

export type SearchFacet = SearchStatsFacet | SearchTermsFacet

/** Returned facet order. Only applies if facet type is `terms` */
export type SearchFacetOrder =
  /** Order by term count */
  | "count"
  /** Order by term name */
  | "index"

export interface SearchFacetTerm {
  /** How many products had this term */
  count: number
  /** Was this term selected, to add selected checkbox in frontend */
  selected: boolean
  /** Term value */
  value: string
}

/** Type of facet */
export type SearchFacetType =
  /** Returns min and max values for a numeric field */
  | "stats"
  /** Returns all unique terms in a field */
  | "terms"

export interface SearchHighlight {
  keyword?: string
}

export interface SearchKeyword {
  _explain?: unknown
  _highlight?: SearchHighlight
  _redirect?: string
  _score?: number
  facets: SearchFacet[]
  keyword: string
  position?: number
  /** @deprecated Use position instead. */
  priority: number
  total: number
}

export interface SearchKeywords {
  /** Unmodified request parameter `from` to be used for further pagination */
  from?: number
  /** If main search query returned no results and fuzzy search was triggered */
  fuzzy?: boolean
  /** Keyword list */
  hits: SearchKeyword[]
  /** Unmodified request parameter `size` to be used for further pagination */
  size?: number
  /** How many products were found */
  total: number
}

/** Determines how out of stock products are handled */
export type SearchOutOfStockBehaviour =
  /** Moves out of stock products to the end of search results */
  | "deboost"
  /** Hides out of stock products */
  | "hide"
  /** Does not handle out of stock products in any special way */
  | "none"

/** Defines how input values and expected values are compared */
export type SearchParamComparisonFunction =
  /** Applies partial match on param value from expected values list */
  | "contains"
  /** Applies stemming algorithm to param values and expected values and does an exact match of outputs */
  | "stemmed"
  /** Applies stemming algorithm and does partial match on param value from expected values list */
  | "stemmedContains"

export interface SearchProduct {
  _explain?: unknown
  _pinned?: boolean
  _score?: number
  affinities?: SearchProductAffinities
  ageGroup?: string
  ai?: SearchProductAiDetected
  alternateImageUrls?: string[]
  availability?: string
  available?: boolean
  brand?: string
  categories?: string[]
  categoryIds?: string[]
  condition?: string
  customFields?: SearchProductCustomField[]
  datePublished?: number
  description?: string
  extra?: SearchProductExtra[]
  gender?: string
  googleCategory?: string
  gtin?: string
  /** Product image url */
  imageUrl?: string
  inventoryLevel?: number
  isExcluded?: boolean
  listPrice?: number
  /** Product Name */
  name?: string
  onDiscount?: boolean
  pid?: string
  price?: number
  priceCurrencyCode?: string
  priceText?: string
  productId?: string
  ratingValue?: number
  realVariantIds?: string[]
  reviewCount?: number
  saleable?: boolean
  skus?: SearchProductSku[]
  stats?: SearchProductStats
  supplierCost?: number
  tags1?: string[]
  tags2?: string[]
  tags3?: string[]
  /** Product thumbnail url */
  thumbUrl?: string
  unitPricingBaseMeasure?: number
  unitPricingMeasure?: number
  unitPricingUnit?: string
  /** Product page url */
  url?: string
  variantId?: string
  variations?: SearchProductKeyedVariation[]
}

export interface SearchProductAiDetected {
  dominantColors?: string[]
  overridingColor?: string
  primaryColor?: string
}

export interface SearchProductAffinities {
  brand?: string
  categories?: string[]
  color?: string[]
  size?: string[]
}

export interface SearchProductCustomField {
  key: string
  value: string
}

export interface SearchProductExtra {
  key: string
  value: string[]
}

export interface SearchProductKeyedVariation {
  key: string
  value: SearchVariationValue
}

export interface SearchProductSku {
  ai?: SearchProductAiDetected
  availability?: string
  customFields?: SearchProductCustomField[]
  id?: string
  imageUrl?: string
  inventoryLevel?: number
  listPrice?: number
  name?: string
  price?: number
  priceText?: string
  url?: string
}

export interface SearchProductStats {
  age?: number
  availabilityRatio?: number
  buys?: number
  cartRatio?: number
  clicks?: number
  conversion?: number
  discount?: number
  impressions?: number
  inventoryLevel?: number
  inventoryTurnover?: number
  listPrice?: number
  margin?: number
  marginPercentage?: number
  orders?: number
  price?: number
  profitPerImpression?: number
  profitPerView?: number
  published?: number
  ratingValue?: number
  revenue?: number
  revenuePerImpression?: number
  revenuePerView?: number
  reviewCount?: number
  views?: number
}

export interface SearchProducts {
  /** Unmodified request parameter `categoryId` */
  categoryId?: string
  /** Unmodified request parameter `categoryPath` */
  categoryPath?: string
  /** Returns only one result for each unique value for provided field. Can be used to group product variations (e.g. different colors) */
  collapse?: string
  /** Facet list */
  facets?: SearchFacet[]
  /** Unmodified request parameter `from` to be used for further pagination */
  from?: number
  /** If main search query returned no results and fuzzy search was triggered */
  fuzzy?: boolean
  /** Product list */
  hits: SearchProduct[]
  /** Unmodified request parameter `size` to be used for further pagination */
  size?: number
  /** How many products were found */
  total: number
}

/** Searchable fields of priority */
export type SearchQueryField =
  /** Searchable fields with `High` priority */
  | "high"
  /** Searchable fields with `Low` priority */
  | "low"
  /** Searchable fields with `Medium` priority */
  | "medium"

/** Search response */
export interface SearchResult {
  /** Returned if autocorrect was triggered */
  autocorrect?: SearchAutocorrect
  /** Gives additional info on why search results are the way they are. Returned if request was sent with `explain: true` parameter. */
  explain?: SearchExplain
  /** Keywords response */
  keywords?: SearchKeywords
  /** Product response */
  products?: SearchProducts
  /** Search text the results were returned for */
  query?: string
  /** Returns redirect url if redirect rule matched */
  redirect?: string
}

export type SearchRuleScheduleType = "ONE_TIME" | "WEEKLY"

export type SearchRuleScheduleWeekday =
  | "FRIDAY"
  | "MONDAY"
  | "SATURDAY"
  | "SUNDAY"
  | "THURSDAY"
  | "TUESDAY"
  | "WEDNESDAY"

/** Order of the sort */
export type SearchSortOrder = "asc" | "desc"

export interface SearchStatsFacet {
  /** Numeric field for which min/max values were calculated */
  field: string
  id: string
  /** Maximum value of faceted field */
  max: number
  /** Minimum value of faceted field */
  min: number
  name: string
  type: SearchFacetType
}

export interface SearchTermsFacet {
  /** Facet term list */
  data: SearchFacetTerm[]
  /** Field from which terms were calculated */
  field: string
  id: string
  name: string
  type: SearchFacetType
}

export interface SearchVariationValue {
  availability?: string
  listPrice?: number
  price?: number
  priceCurrencyCode?: string
}
