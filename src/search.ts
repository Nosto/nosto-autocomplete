import { SearchOptions, getNostoClient } from "./api/client"
import { InputSearchQueryWithFields } from "./api/search"

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

export function search<State>(
    query: InputSearchQueryWithFields,
    options?: SearchOptions
) {
    const { redirect, track } = options ?? { redirect: false, track: undefined }

    const fields = query.products?.fields ?? defaultProductFields
    const facets = query.products?.facets ?? ["*"]
    const size = query.products?.size ?? 20
    const from = query.products?.from ?? 0

    return getNostoClient()
        .then(api => {
            return api.search(
                {
                    query: query.query,
                    ...query,
                    products: {
                        ...query.products,
                        fields,
                        facets,
                        size,
                        from,
                    },
                },
                {
                    redirect,
                    track,
                }
            )
        })
        .then(
            response =>
                ({
                    query,
                    response,
                }) as State
        )
}
