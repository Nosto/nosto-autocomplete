import { AnyPromise } from "../utils/promise"
import { InputSearchQueryWithFields, SearchOptions } from "./search"
import { SearchResult } from "./search/generated"

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
    recordSearchSubmit(query: string): void,
    captureError: (error: unknown, reporter: string, level: 'debug' | 'info' | 'warn' | 'error') => void
}

/**
 * @group Nosto Client
 * @category Core
 */
export function getNostoClient(): PromiseLike<NostoClient> {
    return new AnyPromise((resolve, reject) => {
        if ("nostojs" in window && typeof window.nostojs === "function") {
            window.nostojs((api: NostoClient) => {
                resolve(api)
            })
        } else {
            reject("nostojs not found")
        }
    })
}

export function logAndCaptureError(error: unknown, level: 'debug' | 'info' | 'warn' | 'error') {
    getNostoClient().then(api => {
        api.captureError(error, 'nostoAutocomplete', level)
    })
    const acceptedLogs = ['debug', 'info', 'warn', 'error']
    if (level in acceptedLogs) {
        console[level](error)
    }
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
