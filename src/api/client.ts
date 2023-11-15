import { AnyPromise } from "../utils/promise"
import { InputSearchQuery, SearchResult } from "./search/generated"

/**
 * @group Nosto Client
 * @category Core
 */
export interface NostoClient {
    addOrder(order: { purchase: Purchase }): NostoClient
    defaultSession(): NostoClient
    setAutoLoad(autoload: boolean): NostoClient
    setCart(cart?: Cart): NostoClient
    setCustomer(customer?: Customer): NostoClient
    setPlacements(placements: string[]): NostoClient
    setResponseMode(mode: string): NostoClient
    setVariation(variation: string): NostoClient
    viewCategory(category: string): NostoClient
    viewProduct(product: string): NostoClient
    viewFrontPage(): NostoClient
    viewNotFound(): NostoClient
    viewOther(): NostoClient
    viewSearch(query: string): NostoClient
    viewCart(): NostoClient
    load(): PromiseLike<{
        affinities: Record<
            string,
            {
                name: string
                score: number
            }[]
        >
        geo_location?: string[]
        page_views: number
        recommendations: Recommendation[]
    }>
    placements: {
        getPlacements(): string[]
    }
    search(
        query: InputSearchQuery,
        options?: {
            track?: "autocomplete" | "category" | "serp"
            redirect?: boolean
        }
    ): PromiseLike<SearchResult>
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
