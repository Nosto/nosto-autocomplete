export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Json: { input: unknown; output: unknown; }
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
  all?: InputMaybe<Array<InputSearchFilter>>;
  /** Joins nested filters with logical OR */
  any?: InputMaybe<Array<InputSearchFilter>>;
  /** Product field to apply filter on */
  field?: InputMaybe<Scalars['String']['input']>;
  /**
   *
   * If `true`, matches all products which have the value on selected field.
   * If `false`, matches all products which have no value in selected field.
   *
   */
  hasValue?: InputMaybe<Scalars['Boolean']['input']>;
  /** Joins nested filters with logical AND and inverts match */
  not?: InputMaybe<Array<InputSearchFilter>>;
  /** List of prefixes to match */
  prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of range filters to apply */
  range?: InputMaybe<Array<InputSearchRangeFilter>>;
  /** List of values to filter by, joined by OR operator */
  value?: InputMaybe<Array<Scalars['String']['input']>>;
  /** boost weight */
  weight: Scalars['Float']['input'];
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
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Field on which facet will be calculated */
  field?: InputMaybe<Scalars['String']['input']>;
  /** Facet ID */
  id: Scalars['String']['input'];
  /** Adds a infix filter on facet's terms. Only applies if type is `terms`. Cannot be combined with prefix */
  infix?: InputMaybe<Array<Scalars['String']['input']>>;
  /** This name is returned with search response. Used as a display name in frontend */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Returned facet order. Only applies if type is `terms` */
  order?: InputMaybe<SearchFacetOrder>;
  /** Returned facet position in search response facets array */
  position?: InputMaybe<Scalars['Int']['input']>;
  /** Adds a prefix filter on facet's terms. Only applies if type is `terms`. Cannot be combined with infix */
  prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  /** How many facet terms to return. Only applies if type is `terms` */
  size?: InputMaybe<Scalars['Int']['input']>;
  /** Facet type */
  type?: InputMaybe<SearchFacetType>;
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
  all?: InputMaybe<Array<InputSearchFilter>>;
  /** Joins nested filters with logical OR */
  any?: InputMaybe<Array<InputSearchFilter>>;
  /** Product field to apply filter on */
  field?: InputMaybe<Scalars['String']['input']>;
  /**
   *
   * If `true`, matches all products which have the value on selected field.
   * If `false`, matches all products which have no value in selected field.
   *
   */
  hasValue?: InputMaybe<Scalars['Boolean']['input']>;
  /** Joins nested filters with logical AND and inverts match */
  not?: InputMaybe<Array<InputSearchFilter>>;
  /** List of prefixes to match */
  prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of range filters to apply */
  range?: InputMaybe<Array<InputSearchRangeFilter>>;
  /** List of values to filter by, joined by OR operator */
  value?: InputMaybe<Array<Scalars['String']['input']>>;
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
  postTag: Scalars['String']['input'];
  preTag: Scalars['String']['input'];
}

export interface InputSearchKeywords {
  /** List of custom boosts */
  boost?: InputMaybe<Array<InputSearchBoost>>;
  /** Matches all objects if query is not provided or empty. Defaults to false. */
  emptyQueryMatchesAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of filters. Values are joined with AND operator */
  filter?: InputMaybe<Array<InputSearchTopLevelFilter>>;
  /** Offset of returned keyword list. Used for pagination, use together with `size` parameter */
  from?: InputMaybe<Scalars['Int']['input']>;
  /** Highlight tag */
  highlight?: InputMaybe<InputSearchHighlight>;
  /** How many keywords will be returned */
  size?: InputMaybe<Scalars['Int']['input']>;
  /** Sets how results should be sorted. After sorting by all the options provided in sort param, or in case sort param is not set, results will be sorted by relevance.  */
  sort?: InputMaybe<Array<InputSearchSort>>;
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
  field?: InputMaybe<Scalars['String']['input']>;
  /** Where the pinned product will appear on the search page. Starts from 1 */
  position: Scalars['Int']['input'];
  /** If product field matches any of the provided values, pin will be applied. Currently, only exact match of values is supported */
  value: Array<Scalars['String']['input']>;
}

export interface InputSearchProducts {
  /** List of custom boosts */
  boost?: InputMaybe<Array<InputSearchBoost>>;
  /** Provide category id if search engine is used to get results for category pages. provide either `categoryId` or `categoryPath`, don't use both */
  categoryId?: InputMaybe<Scalars['String']['input']>;
  /** Provide category path if search engine is used to get results for category pages. provide either `categoryId` or `categoryPath`, don't use both */
  categoryPath?: InputMaybe<Scalars['String']['input']>;
  /** Returns only one result for each unique value for provided field. Can be used to group product variations (e.g. different colors) */
  collapse?: InputMaybe<Scalars['String']['input']>;
  /** Enables to add or modify facet configuration on query time. If facet with the same ID is present in the dashboard configuration, their parameters will be merged. In that case, only partial facet parameters can be provided. If facet is not present in the configuration, all required params must be present. */
  customFacets?: InputMaybe<Array<InputSearchFacetConfig>>;
  /** Matches all objects if query is not provided or empty. Defaults to true if no name provided, false for serp and autocomplete */
  emptyQueryMatchesAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** `(Private key only)` Overwrite default exclusions behavior */
  exclusionBehaviour?: InputMaybe<SearchExclusionBehaviour>;
  /** List of facet ID's, the ones configured in the dashboard, to be counted. The search engine will automatically filter out irrelevant facets depending on search queries, so not all facets listed here may be returned. `*` selects all facets */
  facets?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of filters. Values are joined with AND operator */
  filter?: InputMaybe<Array<InputSearchTopLevelFilter>>;
  /** Offset of returned product list. Used for pagination, use together with `size` parameter */
  from?: InputMaybe<Scalars['Int']['input']>;
  /** `(Private key only)` Overwrite default out of stock behavior */
  outOfStockBehaviour?: InputMaybe<SearchOutOfStockBehaviour>;
  /** Used to provide brand, category, and other affinities from Nosto personalization frontend script. These will be different for each user */
  personalizationBoost?: InputMaybe<Array<InputSearchBoost>>;
  /** Personalization impact in comparison to relevance and other boosts */
  personalizationWeight?: InputMaybe<Scalars['Float']['input']>;
  /** Used to change positions of returned products. Pinning rearranges returned product positions, which means that if product is not returned with search results, it won't be pinned */
  pin?: InputMaybe<Array<InputSearchPin>>;
  /** Same format as filter, but is always applied before counting facets. `excludeFacets` param is not allowed */
  preFilter?: InputMaybe<Array<InputSearchFilter>>;
  /**
   * Queries data only from searchable fields with specified priorities. Use [ `high`, `medium`, `low` ] for serp.
   * Use [ `high`, `medium` ] for autocomplete
   */
  queryFields?: InputMaybe<Array<SearchQueryField>>;
  /** How much weight has relevance in comparison to other scores (e.g. boost) */
  relevanceWeight?: InputMaybe<Scalars['Float']['input']>;
  /** `(Private key only)` Allow private fields to be returned in search results and used in query parameters */
  showPrivateFields?: InputMaybe<Scalars['Boolean']['input']>;
  /** How many products will be returned */
  size?: InputMaybe<Scalars['Int']['input']>;
  /** Sets how results should be sorted. After sorting by all the options provided in sort param, or in case sort param is not set, results will be sorted by relevance. For example, if you set sort by availability status, products with the same availability status will be sorted by relevance. */
  sort?: InputMaybe<Array<InputSearchSort>>;
  /** Selects product variation or currency */
  variationId?: InputMaybe<Scalars['String']['input']>;
}

export interface InputSearchQuery {
  /** Your account ID */
  accountId?: InputMaybe<Scalars['String']['input']>;
  /** Any custom rules that should be added in this search request. These rules are appended to the rule list defined in nosto dashboard */
  customRules?: InputMaybe<Array<InputSearchRule>>;
  /** `(Private key only)` Returns scoring information for each object if true. This should only be used for debugging as performance will suffer. If not needed, omit this parameter */
  explain?: InputMaybe<Scalars['Boolean']['input']>;
  /** Keyword specific parameters */
  keywords?: InputMaybe<InputSearchKeywords>;
  /** Product specific parameters */
  products?: InputMaybe<InputSearchProducts>;
  /** Search text (raw user input) */
  query?: InputMaybe<Scalars['String']['input']>;
  redirect?: InputMaybe<Scalars['String']['input']>;
  /** List of rule ID's or ID matching patterns with wildcards. Patterns [ `global-*`, `query-*` ] should be used here to match all rules created in dashboard */
  rules?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Segment ID's user belongs to */
  segments?: InputMaybe<Array<Scalars['String']['input']>>;
  sessionParams?: InputMaybe<InputSearchQuery>;
  /** `(Private key only)` Overwrites current time. Used to trigger scheduled rules ahead of schedule */
  time?: InputMaybe<Scalars['Float']['input']>;
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
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equals */
  gte?: InputMaybe<Scalars['String']['input']>;
  /** Lower than */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Lower than or equals */
  lte?: InputMaybe<Scalars['String']['input']>;
}

/** Rules allow search query modification based on search parameters */
export interface InputSearchRule {
  /** Used to disable rules creating through dashboard */
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  /** Condition that must be met for query to match */
  match?: InputMaybe<InputSearchRuleMatch>;
  /** User friendly name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Defines when the rule will be applied based on date/time */
  schedule?: InputMaybe<Array<InputSearchSchedule>>;
  /** Search query parameters that will be set if rule matches. Same format as search query itself but not all params are allowed */
  set?: InputMaybe<InputSearchQuery>;
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
  all?: InputMaybe<Array<InputSearchRuleMatch>>;
  /** Applies logical OR to nested rule match clauses. Matches if any of them match */
  any?: InputMaybe<Array<InputSearchRuleMatch>>;
  /** If set to `true`, rule will always match. Skip this parameter if it's not needed, does not accept `false` value. Used to create global rules in dashboard */
  everything?: InputMaybe<Scalars['Boolean']['input']>;
  /** Expected values to be compared against. Rule matches if at least one of them matches */
  function?: InputMaybe<SearchParamComparisonFunction>;
  /** Applies logical NOT to rule match clause. Matches if nested clause does not match */
  not?: InputMaybe<InputSearchRuleMatch>;
  /** Param from search query from where the value will be extracted */
  param?: InputMaybe<Scalars['String']['input']>;
  /** Expected values to be compared against. Rule matches if at least one of them matches */
  value?: InputMaybe<Array<Scalars['String']['input']>>;
}

/** Defines when the rule will be applied based on date/time */
export interface InputSearchSchedule {
  /** Date in format `yyyy-MM-dd'T'HH:mm:ss`. Only applies if type is `ONE_TIME` */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Format example `12:00:00`. Only applies if type is `weekly` */
  fromTime?: InputMaybe<Scalars['String']['input']>;
  /** Format example `Europe/Paris` */
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** Date in format `yyyy-MM-dd'T'HH:mm:ss`. Only applies if type is `ONE_TIME` */
  to?: InputMaybe<Scalars['String']['input']>;
  /** Format example `16:00:00`. Only applies if type is `weekly` */
  toTime?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<SearchRuleScheduleType>;
  /** Array of days to trigger the rule. Only applies if type is `weekly` */
  weekDays?: InputMaybe<Array<SearchRuleScheduleWeekday>>;
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
  field: Scalars['String']['input'];
  order: SearchSortOrder;
}

/** Same as `InputSearchFilter` type, but accepts an additional optional parameter `excludeFacets` */
export interface InputSearchTopLevelFilter {
  /** Joins nested filters with logical AND */
  all?: InputMaybe<Array<InputSearchFilter>>;
  /** Joins nested filters with logical OR */
  any?: InputMaybe<Array<InputSearchFilter>>;
  /** List of facet ID's to which this filter should not be applied. (default: all facets with the same field as filter if filter contains field, otherwise empty) */
  excludeFacets?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Product field to apply filter on */
  field?: InputMaybe<Scalars['String']['input']>;
  /**
   *
   * If true, matches all products which have the value on selected field.
   * If false, matches all products which have no value in selected field.
   *
   */
  hasValue?: InputMaybe<Scalars['Boolean']['input']>;
  /** Joins nested filters with logical AND and inverts match */
  not?: InputMaybe<Array<InputSearchFilter>>;
  /** List of prefixes to match */
  prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of range filters to apply */
  range?: InputMaybe<Array<InputSearchRangeFilter>>;
  /** List of values to filter by, joined by OR operator */
  value?: InputMaybe<Array<Scalars['String']['input']>>;
}

/** Query search engine for search results */
export interface Query {
  search?: Maybe<SearchResult>;
}


/** Query search engine for search results */
export interface QuerySearchArgs {
  accountId?: InputMaybe<Scalars['String']['input']>;
  customRules?: InputMaybe<Array<InputSearchRule>>;
  explain?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<InputSearchKeywords>;
  products?: InputMaybe<InputSearchProducts>;
  query?: InputMaybe<Scalars['String']['input']>;
  redirect?: InputMaybe<Scalars['String']['input']>;
  rules?: InputMaybe<Array<Scalars['String']['input']>>;
  segments?: InputMaybe<Array<Scalars['String']['input']>>;
  sessionParams?: InputMaybe<InputSearchQuery>;
  time?: InputMaybe<Scalars['Float']['input']>;
}

export interface SearchAutocorrect {
  /** Original query value before autocorrect */
  original: Scalars['String']['output'];
}

/** Determines how excluded products are handled */
export type SearchExclusionBehaviour =
  /** Moves excluded products to the end of search results */
  | 'deboost'
  /** Hides excluded products */
  | 'hide'
  /** Does not handle excluded products in any special way */
  | 'none';

/** Gives additional info on why search results are the way they are. */
export interface SearchExplain {
  /** Matched rules are returned */
  matchedRules: Array<SearchExplainRule>;
}

export interface SearchExplainRule {
  id: Scalars['String']['output'];
  /** Name of the rule that matched */
  name?: Maybe<Scalars['String']['output']>;
  /** JSON object scalar, parse on frontend. Which params were set after triggering query rule */
  set?: Maybe<Scalars['Json']['output']>;
}

export type SearchFacet = SearchStatsFacet | SearchTermsFacet;

/** Returned facet order. Only applies if facet type is `terms` */
export type SearchFacetOrder =
  /** Order by term count */
  | 'count'
  /** Order by term name */
  | 'index';

export interface SearchFacetTerm {
  /** How many products had this term */
  count: Scalars['Int']['output'];
  /** Was this term selected, to add selected checkbox in frontend */
  selected: Scalars['Boolean']['output'];
  /** Term value */
  value: Scalars['String']['output'];
}

/** Type of facet */
export type SearchFacetType =
  /** Returns min and max values for a numeric field */
  | 'stats'
  /** Returns all unique terms in a field */
  | 'terms';

export interface SearchHighlight {
  keyword?: Maybe<Scalars['String']['output']>;
}

export interface SearchKeyword {
  _explain?: Maybe<Scalars['Json']['output']>;
  _highlight?: Maybe<SearchHighlight>;
  _redirect?: Maybe<Scalars['String']['output']>;
  _score?: Maybe<Scalars['Float']['output']>;
  facets: Array<SearchFacet>;
  keyword: Scalars['String']['output'];
  position?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use position instead. */
  priority: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
}

export interface SearchKeywords {
  /** Unmodified request parameter `from` to be used for further pagination */
  from?: Maybe<Scalars['Int']['output']>;
  /** If main search query returned no results and fuzzy search was triggered */
  fuzzy?: Maybe<Scalars['Boolean']['output']>;
  /** Keyword list */
  hits: Array<SearchKeyword>;
  /** Unmodified request parameter `size` to be used for further pagination */
  size?: Maybe<Scalars['Int']['output']>;
  /** How many products were found */
  total: Scalars['Int']['output'];
}

/** Determines how out of stock products are handled */
export type SearchOutOfStockBehaviour =
  /** Moves out of stock products to the end of search results */
  | 'deboost'
  /** Hides out of stock products */
  | 'hide'
  /** Does not handle out of stock products in any special way */
  | 'none';

/** Defines how input values and expected values are compared */
export type SearchParamComparisonFunction =
  /** Applies partial match on param value from expected values list */
  | 'contains'
  /** Applies stemming algorithm to param values and expected values and does an exact match of outputs */
  | 'stemmed'
  /** Applies stemming algorithm and does partial match on param value from expected values list */
  | 'stemmedContains';

export interface SearchProduct {
  _explain?: Maybe<Scalars['Json']['output']>;
  _pinned?: Maybe<Scalars['Boolean']['output']>;
  _score?: Maybe<Scalars['Float']['output']>;
  affinities?: Maybe<SearchProductAffinities>;
  ageGroup?: Maybe<Scalars['String']['output']>;
  ai?: Maybe<SearchProductAiDetected>;
  alternateImageUrls?: Maybe<Array<Scalars['String']['output']>>;
  availability?: Maybe<Scalars['String']['output']>;
  available?: Maybe<Scalars['Boolean']['output']>;
  brand?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  categoryIds?: Maybe<Array<Scalars['String']['output']>>;
  condition?: Maybe<Scalars['String']['output']>;
  customFields?: Maybe<Array<SearchProductCustomField>>;
  datePublished?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  extra?: Maybe<Array<SearchProductExtra>>;
  gender?: Maybe<Scalars['String']['output']>;
  googleCategory?: Maybe<Scalars['String']['output']>;
  gtin?: Maybe<Scalars['String']['output']>;
  /** Product image url */
  imageUrl?: Maybe<Scalars['String']['output']>;
  inventoryLevel?: Maybe<Scalars['Int']['output']>;
  isExcluded?: Maybe<Scalars['Boolean']['output']>;
  listPrice?: Maybe<Scalars['Float']['output']>;
  /** Product Name */
  name?: Maybe<Scalars['String']['output']>;
  onDiscount?: Maybe<Scalars['Boolean']['output']>;
  pid?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  priceCurrencyCode?: Maybe<Scalars['String']['output']>;
  priceText?: Maybe<Scalars['String']['output']>;
  productId?: Maybe<Scalars['String']['output']>;
  ratingValue?: Maybe<Scalars['Float']['output']>;
  realVariantIds?: Maybe<Array<Scalars['String']['output']>>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  saleable?: Maybe<Scalars['Boolean']['output']>;
  skus?: Maybe<Array<SearchProductSku>>;
  stats?: Maybe<SearchProductStats>;
  supplierCost?: Maybe<Scalars['Float']['output']>;
  tags1?: Maybe<Array<Scalars['String']['output']>>;
  tags2?: Maybe<Array<Scalars['String']['output']>>;
  tags3?: Maybe<Array<Scalars['String']['output']>>;
  /** Product thumbnail url */
  thumbUrl?: Maybe<Scalars['String']['output']>;
  unitPricingBaseMeasure?: Maybe<Scalars['Float']['output']>;
  unitPricingMeasure?: Maybe<Scalars['Float']['output']>;
  unitPricingUnit?: Maybe<Scalars['String']['output']>;
  /** Product page url */
  url?: Maybe<Scalars['String']['output']>;
  variantId?: Maybe<Scalars['String']['output']>;
  variations?: Maybe<Array<SearchProductKeyedVariation>>;
}

export interface SearchProductAiDetected {
  dominantColors?: Maybe<Array<Scalars['String']['output']>>;
  overridingColor?: Maybe<Scalars['String']['output']>;
  primaryColor?: Maybe<Scalars['String']['output']>;
}

export interface SearchProductAffinities {
  brand?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  color?: Maybe<Array<Scalars['String']['output']>>;
  size?: Maybe<Array<Scalars['String']['output']>>;
}

export interface SearchProductCustomField {
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface SearchProductExtra {
  key: Scalars['String']['output'];
  value: Array<Scalars['String']['output']>;
}

export interface SearchProductKeyedVariation {
  key: Scalars['String']['output'];
  value: SearchVariationValue;
}

export interface SearchProductSku {
  ai?: Maybe<SearchProductAiDetected>;
  availability?: Maybe<Scalars['String']['output']>;
  customFields?: Maybe<Array<SearchProductCustomField>>;
  id?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  inventoryLevel?: Maybe<Scalars['Int']['output']>;
  listPrice?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  priceText?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
}

export interface SearchProductStats {
  age?: Maybe<Scalars['Float']['output']>;
  availabilityRatio?: Maybe<Scalars['Float']['output']>;
  buys?: Maybe<Scalars['Float']['output']>;
  cartRatio?: Maybe<Scalars['Float']['output']>;
  clicks?: Maybe<Scalars['Float']['output']>;
  conversion?: Maybe<Scalars['Float']['output']>;
  discount?: Maybe<Scalars['Float']['output']>;
  impressions?: Maybe<Scalars['Float']['output']>;
  inventoryLevel?: Maybe<Scalars['Float']['output']>;
  inventoryTurnover?: Maybe<Scalars['Float']['output']>;
  listPrice?: Maybe<Scalars['Float']['output']>;
  margin?: Maybe<Scalars['Float']['output']>;
  marginPercentage?: Maybe<Scalars['Float']['output']>;
  orders?: Maybe<Scalars['Float']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  profitPerImpression?: Maybe<Scalars['Float']['output']>;
  profitPerView?: Maybe<Scalars['Float']['output']>;
  published?: Maybe<Scalars['Float']['output']>;
  ratingValue?: Maybe<Scalars['Float']['output']>;
  revenue?: Maybe<Scalars['Float']['output']>;
  revenuePerImpression?: Maybe<Scalars['Float']['output']>;
  revenuePerView?: Maybe<Scalars['Float']['output']>;
  reviewCount?: Maybe<Scalars['Float']['output']>;
  views?: Maybe<Scalars['Float']['output']>;
}

export interface SearchProducts {
  /** Unmodified request parameter `categoryId` */
  categoryId?: Maybe<Scalars['String']['output']>;
  /** Unmodified request parameter `categoryPath` */
  categoryPath?: Maybe<Scalars['String']['output']>;
  /** Returns only one result for each unique value for provided field. Can be used to group product variations (e.g. different colors) */
  collapse?: Maybe<Scalars['String']['output']>;
  /** Facet list */
  facets?: Maybe<Array<SearchFacet>>;
  /** Unmodified request parameter `from` to be used for further pagination */
  from?: Maybe<Scalars['Int']['output']>;
  /** If main search query returned no results and fuzzy search was triggered */
  fuzzy?: Maybe<Scalars['Boolean']['output']>;
  /** Product list */
  hits: Array<SearchProduct>;
  /** Unmodified request parameter `size` to be used for further pagination */
  size?: Maybe<Scalars['Int']['output']>;
  /** How many products were found */
  total: Scalars['Int']['output'];
}

/** Searchable fields of priority */
export type SearchQueryField =
  /** Searchable fields with `High` priority */
  | 'high'
  /** Searchable fields with `Low` priority */
  | 'low'
  /** Searchable fields with `Medium` priority */
  | 'medium';

/** Search response */
export interface SearchResult {
  /** Returned if autocorrect was triggered */
  autocorrect?: Maybe<SearchAutocorrect>;
  /** Gives additional info on why search results are the way they are. Returned if request was sent with `explain: true` parameter. */
  explain?: Maybe<SearchExplain>;
  /** Keywords response */
  keywords?: Maybe<SearchKeywords>;
  /** Product response */
  products?: Maybe<SearchProducts>;
  /** Search text the results were returned for */
  query?: Maybe<Scalars['String']['output']>;
  /** Returns redirect url if redirect rule matched */
  redirect?: Maybe<Scalars['String']['output']>;
}

export type SearchRuleScheduleType =
  | 'ONE_TIME'
  | 'WEEKLY';

export type SearchRuleScheduleWeekday =
  | 'FRIDAY'
  | 'MONDAY'
  | 'SATURDAY'
  | 'SUNDAY'
  | 'THURSDAY'
  | 'TUESDAY'
  | 'WEDNESDAY';

/** Order of the sort */
export type SearchSortOrder =
  | 'asc'
  | 'desc';

export interface SearchStatsFacet {
  /** Numeric field for which min/max values were calculated */
  field: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Maximum value of faceted field */
  max: Scalars['Float']['output'];
  /** Minimum value of faceted field */
  min: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  type: SearchFacetType;
}

export interface SearchTermsFacet {
  /** Facet term list */
  data: Array<SearchFacetTerm>;
  /** Field from which terms were calculated */
  field: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: SearchFacetType;
}

export interface SearchVariationValue {
  availability?: Maybe<Scalars['String']['output']>;
  listPrice?: Maybe<Scalars['Float']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  priceCurrencyCode?: Maybe<Scalars['String']['output']>;
}
