import { InputSearchQueryWithFields, SearchOptions } from "./search"
import { SearchResult } from "./search/generated"

/**
 * @group Nosto Client
 * @category Core
 */
type LogLevel = "error" | "warn" | "info" | "debug"
/**
 * @group Nosto Client
 * @category Core
 */
export interface Affinity {
    name: string
    score: number
}

/**
 * @group Nosto Client
 * @category Core
 */
export interface SessionAction {
    setPlacements(placements: string[]): SessionAction
    load(): Promise<{
        affinities: Record<string, Affinity[]>
        geo_location?: string[]
        page_views: number
        recommendations: Recommendation[]
    }>
}

/**
 * @group Nosto Client
 * @category Core
 */
export interface NostoSession {
    setCart(cart?: Cart): NostoSession
    setCustomer(customer?: Customer): NostoSession
    setResponseMode(mode: string): NostoSession
    setVariation(variation?: string): NostoSession
    addOrder(order: { purchase: Purchase }): SessionAction
    viewCategory(category: string): SessionAction
    viewProduct(product: string): SessionAction
    viewFrontPage(): SessionAction
    viewNotFound(): SessionAction
    viewOther(): SessionAction
    viewSearch(query: string): SessionAction
    viewCart(): SessionAction
}

/**
 * @group Nosto Client
 * @category Core
 */
export interface NostoClient {
    setAutoLoad(autoload: boolean): NostoClient
    defaultSession(): NostoSession
    placements: {
        getPlacements(): string[]
        injectCampaigns(recommendations: Record<string, Recommendation>): void
    }
    search(
        query: InputSearchQueryWithFields,
        options?: SearchOptions
    ): PromiseLike<SearchResult>
    recordSearchClick(
        type: "serp" | "autocomplete" | "category",
        hit: { url?: string; keyword?: string }
    ): void
    recordSearchSubmit(query: string): void
    captureError(
        error: unknown,
        reporter: string,
        level: LogLevel
    ): void
}

/**
 * @group Nosto Client
 * @category Core
 */
export function getNostoClient(): PromiseLike<NostoClient> {
    return new Promise((resolve, reject) => {
        if ("nostojs" in window && typeof window.nostojs === "function") {
            window.nostojs((api: NostoClient) => {
                resolve(api)
            })
        } else {
            reject("nostojs not found")
        }
    })
}
/**
 *
 * @param msg Message to log
 * @param error Error instance to log
 * @param level Log level string
 */
export function log(message: string, error: unknown, level: LogLevel): void
/**
 *
 * @param error Error instance to log
 * @param level Log level string
 */
export function log(error: unknown, level: LogLevel): void
export function log(
    msgOrError: unknown,
    errorOrLevel: unknown,
    optLevel?: LogLevel
) {
    const msg = typeof msgOrError === "string" ? msgOrError : undefined
    const error = optLevel ? errorOrLevel : !msg ? msgOrError : undefined
    // @ts-expect-error type mismatch
    const level: LogLevel = (optLevel || (typeof errorOrLevel === "string" ? errorOrLevel : "error"))
    if (error) {
        (async () => {
            const api = await getNostoClient()
            api.captureError(error, "nostoAutocomplete", level)
        })()        
    }
    console[level](...[msg, error].filter(Boolean))
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Recommendation {
    result_id: string
    products: Product[]
    result_type: string
    title: string
    div_id: string
    source_product_ids: string[]
    params: unknown
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Item {
    name: string
    price_currency_code: string
    product_id: string
    quantity: number
    sku_id: string
    unit_price: number
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Cart {
    items: Item[]
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Customer {
    customer_reference: string
    email: string
    first_name: string
    last_name: string
    newsletter: boolean
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Buyer {
    first_name: string
    last_name: string
    email: string
    type: string
    newsletter: boolean
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Purchase {
    number: string
    info: Buyer
    items: Item[]
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface SKU {
    id: string
    name: string
    price: number
    listPrice?: number
    url: URL
    imageUrl: URL
    gtin?: string
    availability: "InStock" | "OutOfStock"
    customFields?: { [key: string]: string }
}

/**
 * @group Nosto Client
 * @category Recommendation Types
 */
export interface Product {
    alternateImageUrls?: URL[]
    availability: "InStock" | "OutOfStock"
    brand?: string
    category: string[]
    categoryIds?: string[]
    description: string
    googleCategory?: string
    condition?: string
    gender?: string
    ageGroup?: string
    gtin?: string
    imageUrl: URL
    listPrice?: number
    name: string
    price: number
    ratingValue?: number
    reviewCount?: number
    priceCurrencyCode: string
    productId: string
    tags1?: string[]
    tags2?: string[]
    tags3?: string[]
    thumbUrl?: URL
    url: URL
    customFields?: { [key: string]: string }
    variationId?: string
    skus?: SKU[]
}
