/** @module react */
import type { SearchKeyword, SearchProduct } from "@nosto/nosto-js/client"

export interface AutocompleteProps {
  /**
   * The response from the autocomplete API.
   */
  response?: {
    keywords: {
      hits: SearchKeyword[]
    }
    products: {
      hits: SearchProduct[]
    }
  }
  history?: {
    item: string
  }[]
}

/**
 * The default autocomplete component.
 *
 * @param props Autocomplete props.
 * @returns The JSX element.
 * @group Autocomplete
 * @category React
 */
export function Autocomplete({ response, history }: AutocompleteProps) {
  const hasKeywords = !!response?.keywords?.hits?.length
  const hasProducts = !!response?.products?.hits?.length
  const hasHistory = !!history?.length

  if (!hasKeywords && !hasProducts && !hasHistory) {
    return null
  }

  return (
    <div className="ns-autocomplete-results">
      {!hasKeywords && !hasProducts && hasHistory ? (
        <History history={history} />
      ) : hasKeywords || hasProducts ? (
        <>
          {hasKeywords && <Keywords keywords={response.keywords.hits} />}
          {hasProducts && <Products products={response.products.hits} />}
          <div className="ns-autocomplete-submit">
            <button type="submit" className="ns-autocomplete-button">
              See all search results
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

function History({ history }: { history: AutocompleteProps["history"] }) {
  return (
    <>
      <div className="ns-autocomplete-history">
        <div className="ns-autocomplete-header">Recently searched</div>
        {history?.map((hit, index) => {
          return (
            <div
              className="ns-autocomplete-history-item"
              data-ns-hit={JSON.stringify(hit)}
              data-testid="history"
              key={index}
            >
              {hit.item}
              <a
                href="#"
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

function Keywords({ keywords }: { keywords: SearchKeyword[] }) {
  return (
    <div className="ns-autocomplete-keywords">
      <div className="ns-autocomplete-header">Keywords</div>
      {keywords?.map((hit, index) => {
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
}

function Products({ products }: { products: SearchProduct[] }) {
  return (
    <div className="ns-autocomplete-products">
      <div className="ns-autocomplete-header">Products</div>
      {products.map(hit => {
        return (
          <a
            className="ns-autocomplete-product"
            href="#"
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
                <div className="ns-autocomplete-product-brand">{hit.brand}</div>
              )}
              <div className="ns-autocomplete-product-name">{hit.name}</div>
              <div>
                <span>{hit.price}&euro;</span>
                {hit.listPrice && hit.listPrice !== hit.price && (
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
}
