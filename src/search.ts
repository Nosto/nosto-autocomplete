import { getNostoClient } from "./api/client"
import { InputSearchQueryWithFields, SearchOptions } from "./api/search"

const defaultProductFields = [
    "productId",
    "url",
    "name",
    "imageUrl",
    "thumbUrl",
    "description",
    "brand",
    "variantId",
    "availability",
    "price",
    "priceText",
    "categoryIds",
    "categories",
    "customFields.key",
    "customFields.value",
    "priceCurrencyCode",
    "datePublished",
    "listPrice",
    "unitPricingBaseMeasure",
    "unitPricingUnit",
    "unitPricingMeasure",
    "googleCategory",
    "gtin",
    "ageGroup",
    "gender",
    "condition",
    "alternateImageUrls",
    "ratingValue",
    "reviewCount",
    "inventoryLevel",
    "skus.id",
    "skus.name",
    "skus.price",
    "skus.listPrice",
    "skus.priceText",
    "skus.url",
    "skus.imageUrl",
    "skus.inventoryLevel",
    "skus.customFields.key",
    "skus.customFields.value",
    "skus.availability",
    "pid",
    "onDiscount",
    "extra.key",
    "extra.value",
    "saleable",
    "available",
    "tags1",
    "tags2",
    "tags3",
]

/**
 *
 * @param query Query object.
 * @param options Options object.
 * @returns Promise of search response.
 * @group Autocomplete
 * @category Core
 * @example
 * ```js
 * import { search } from "@nosto/autocomplete"
 *
 * search({
 *     query: "shoes",
 *     products: {
 *       fields: ["name", "price"],
 *       facets: ["brand", "category"],
 *       size: 10,
 *       from: 0,
 *     }
 * }).then((state) => {
 *    console.log(state.response)
 * })
 * ```
 */
export async function search(
    query: InputSearchQueryWithFields,
    options?: SearchOptions
) {
    const { redirect, track } = options ?? { redirect: false, track: undefined }

    const fields = query.products?.fields ?? defaultProductFields
    const facets = query.products?.facets ?? ["*"]
    const size = query.products?.size ?? 20
    const from = query.products?.from ?? 0

    const api = await getNostoClient()
    const response = await api.search({
            ...query,
            products: {
                ...query.products,
                fields,
                facets,
                size,
                from,
            }
        },
        { redirect, track })

    return { query, response }
}
