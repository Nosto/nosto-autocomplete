import React from 'react'

interface AutocompleteProps {
    response?: {
        keywords: {
            hits: {
                keyword: any
                _highlight: any
                item: string
            }[]
        }
        products: {
            hits: {
                listPrice: any
                price: any
                brand: any
                name: any
                imageUrl: any
                url: any
                item: string
                productId: string
            }[]
        }
    }
    history?: {
        item: string
    }[]
}

export function Autocomplete({ response, history }: AutocompleteProps) {
    const hasKeywords =
        response &&
        response.keywords &&
        response.keywords.hits &&
        response.keywords.hits.length > 0
    const hasProducts =
        response &&
        response.products &&
        response.products.hits &&
        response.products.hits.length > 0
    const hasHistory = history && history.length > 0

    if (!hasKeywords && !hasProducts && !hasHistory) {
        return null
    }

    const renderHistory = () => {
        return (
            <>
                <div className="ns-autocomplete-history">
                    <div className="ns-autocomplete-header">
                        Recently searched
                    </div>
                    {history?.map((hit, index) => {
                        return (
                            <div
                                className="ns-autocomplete-history-item"
                                data-ns-hit={JSON.stringify(hit)}
                                key={index}
                            >
                                {hit.item}
                                <a
                                    href="javascript:void(0)"
                                    className="ns-autocomplete-history-item-remove"
                                    data-ns-remove-history={hit.item}
                                >
                                    &#x2715;
                                </a>
                            </div>
                        )
                    })}
                </div>
                <div className="ns-autocomplete-history-clear">
                    <button
                        type="button"
                        className="ns-autocomplete-button"
                        data-ns-remove-history="all"
                    >
                        Clear history
                    </button>
                </div>
            </>
        )
    }

    const renderKeywords = () => {
        return (
            hasKeywords && (
                <div className="ns-autocomplete-keywords">
                    <div className="ns-autocomplete-header">Keywords</div>
                    {response.keywords.hits.map((hit, index) => {
                        return (
                            <div
                                className="ns-autocomplete-keyword"
                                data-ns-hit={JSON.stringify(hit)}
                                data-testid="keyword"
                                key={index}
                            >
                                {hit._highlight && hit._highlight.keyword ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: hit._highlight.keyword,
                                        }}
                                    ></span>
                                ) : (
                                    <span>{hit.keyword}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        )
    }

    const renderProducts = () => {
        return (
            hasProducts && (
                <div className="ns-autocomplete-products">
                    <div className="ns-autocomplete-header">Products</div>
                    {response.products.hits.map((hit) => {
                        return (
                            <a
                                className="ns-autocomplete-product"
                                href={hit.url}
                                key={hit.productId}
                                data-ns-hit={JSON.stringify(hit)}
                                data-testid="product"
                            >
                                <img
                                    className="ns-autocomplete-product-image"
                                    src={hit.imageUrl}
                                    alt={hit.name}
                                    width="60"
                                    height="40"
                                />
                                <div className="ns-autocomplete-product-info">
                                    {hit.brand && (
                                        <div className="ns-autocomplete-product-brand">
                                            {hit.brand}
                                        </div>
                                    )}
                                    <div className="ns-autocomplete-product-name">
                                        {hit.name}
                                    </div>
                                    <div>
                                        <span>{hit.price}&euro;</span>
                                        {hit.listPrice && (
                                            <span className="ns-autocomplete-product-list-price">
                                                {hit.listPrice}
                                                &euro;
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </a>
                        )
                    })}
                </div>
            )
        )
    }

    return (
        <div className="ns-autocomplete-results">
            {!hasKeywords && !hasProducts && hasHistory
                ? renderHistory()
                : hasKeywords || hasProducts
                ? [
                      renderKeywords(),
                      renderProducts(),
                      <div className="ns-autocomplete-submit">
                          <button
                              type="submit"
                              className="ns-autocomplete-button"
                          >
                              See all search results
                          </button>
                      </div>,
                  ]
                : null}
        </div>
    )
}
