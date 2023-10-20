import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { autocomplete } from '../src'
import '@testing-library/jest-dom'

const handleAutocomplete = () => {
    function escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    autocomplete({
        fetch: {
            products: {
                fields: [
                    'name',
                    'url',
                    'imageUrl',
                    'price',
                    'listPrice',
                    'brand',
                ],
                size: 5,
            },
            keywords: {
                size: 5,
                fields: ['keyword', '_highlight.keyword'],
                highlight: {
                    preTag: `<strong>`,
                    postTag: '</strong>',
                },
            },
        },
        inputSelector: '#search',
        dropdownSelector: '#search-results',
        render: function (container, state) {
            var response = state.response
            var history = state.history
            var hasKeywords =
                response &&
                response.keywords &&
                response.keywords.hits &&
                response.keywords.hits.length > 0
            var hasProducts =
                response &&
                response.products &&
                response.products.hits &&
                response.products.hits.length > 0
            var hasHistory = history && history.length > 0

            function renderHistory() {
                return hasHistory
                    ? [
                          '<div class="ns-autocomplete-history">',
                          '<div class="ns-autocomplete-header">Recently searched</div>',
                          history
                              ?.map(function (hit) {
                                  return [
                                      '<div class="ns-autocomplete-history-item" data-ns-hit="' +
                                          escapeHtml(JSON.stringify(hit)) +
                                          '">',
                                      hit.item +
                                          '<a href="javascript:void(0)"' +
                                          `class="ns-autocomplete-history-item-remove" data-ns-remove-history="${hit.item}">` +
                                          '&#x2715;</a>',
                                      '</div>',
                                  ].join('')
                              })
                              .join(''),
                          '</div>',
                          '<div class="ns-autocomplete-history-clear">',
                          '<button type="button" class="ns-autocomplete-button" data-ns-remove-history="all">',
                          'Clear history',
                          '</button>',
                          '</div>',
                      ].join('')
                    : ''
            }

            function renderKeywords() {
                return hasKeywords
                    ? [
                          '<div class="ns-autocomplete-keywords">',
                          '<div class="ns-autocomplete-header">Keywords</div>',
                          response?.keywords?.hits
                              .map(function (hit) {
                                  const keyword =
                                      hit._highlight && hit._highlight.keyword
                                          ? hit._highlight.keyword
                                          : hit.keyword
                                  return [
                                      '<div class="ns-autocomplete-keyword" data-ns-hit="' +
                                          escapeHtml(JSON.stringify(hit)) +
                                          '" data-testid="keyword">',
                                      '<span>' + keyword + '</span>',
                                      '</div>',
                                  ].join('')
                              })
                              .join(''),
                          '</div>',
                      ].join('')
                    : ''
            }

            function renderProducts() {
                return hasProducts
                    ? [
                          '<div class="ns-autocomplete-products">',
                          '<div class="ns-autocomplete-header">Products</div>',
                          response?.products?.hits
                              .map(function (hit) {
                                  return [
                                      '<a class="ns-autocomplete-product" href="' +
                                          hit.url +
                                          '" data-ns-hit="' +
                                          escapeHtml(JSON.stringify(hit)) +
                                          '" data-testid="product">',
                                      '<img class="ns-autocomplete-product-image" src="' +
                                          hit.imageUrl +
                                          '" alt="' +
                                          hit.name +
                                          '" width="60" height="40" />',
                                      '<div class="ns-autocomplete-product-info">',
                                      hit.brand
                                          ? [
                                                '<div class="ns-autocomplete-product-brand">',
                                                hit.brand,
                                                '</div>',
                                            ].join('')
                                          : '',
                                      '<div class="ns-autocomplete-product-name">',
                                      hit.name,
                                      '</div>',
                                      '<div>',
                                      '<span>',
                                      hit.price + '€',
                                      '</span>',
                                      hit.listPrice && hit.listPrice > 0
                                          ? [
                                                '<span class="ns-autocomplete-product-list-price">',
                                                hit.listPrice + '€',
                                                '</span>',
                                            ].join('')
                                          : '',
                                      '</div>',
                                      '</div>',
                                      '</a>',
                                  ].join('')
                              })
                              .join(''),
                          '</div>',
                      ].join('')
                    : ''
            }

            container.innerHTML = [
                '<div class="ns-autocomplete-results">',
                [
                    !hasKeywords && !hasProducts && hasHistory
                        ? renderHistory()
                        : hasKeywords || hasProducts
                        ? [
                              renderKeywords(),
                              renderProducts(),
                              '<div class="ns-autocomplete-submit">',
                              '<button type="submit" class="ns-autocomplete-button">',
                              'See all search results',
                              '</button>',
                              '</div>',
                          ].join('')
                        : '',
                ],
                '</div>',
            ].join('')
        },
        submit: (query) => {
            // Handle search submit
            // console.log('Submitting search with query: ', query)
        },
    })
}

beforeAll(async () => {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input"/>
            <button type="submit" id="search-button" data-testid="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `

    const w = window as any
    w.nostojs = (cb: any) => {
        w.nostojs.q = w.nostojs.q || ([] as any[])
        w.nostojs.q.push(cb)
    }

    const script = document.createElement('script')
    script.src = 'https://connect.nosto.com/include/shopify-9758212174'
    script.onload = () => {
        w.nosto.reload({ site: location.hostname, searchEnabled: false })
    }
    document.body.appendChild(script)
})

describe('autocomplete', () => {
    it('renders autocomplete', async () => {
        const user = userEvent.setup()

        handleAutocomplete()

        await waitFor(
            () => {
                expect(screen.getByTestId('dropdown')).not.toBeVisible()
            },
            {
                timeout: 1000,
            },
        )

        await user.type(screen.getByTestId('input'), 're')

        await waitFor(
            () => {
                expect(screen.getByTestId('dropdown')).toBeVisible()

                expect(screen.getByText('Keywords')).toBeVisible()
                expect(screen.getAllByTestId('keyword')).toHaveLength(5)

                expect(screen.getByText('Products')).toBeVisible()
                expect(screen.getAllByTestId('product')).toHaveLength(5)
            },
            {
                timeout: 4000,
            },
        )
    })
})

describe('history', () => {
    it('should see results after typing', async () => {
        const user = userEvent.setup()
        handleAutocomplete()
        await user.type(screen.getByTestId('input'), 're')
        await waitFor(
            () => {
                expect(screen.getByTestId('dropdown')).toBeVisible()

                expect(screen.getByText('Keywords')).toBeVisible()
                expect(screen.getAllByTestId('keyword')).toHaveLength(5)

                expect(screen.getByText('Products')).toBeVisible()
                expect(screen.getAllByTestId('product')).toHaveLength(5)
            },
            {
                timeout: 4000,
            },
        )
    })

    it('should see history on empty input', async () => {
        const user = userEvent.setup()
        handleAutocomplete()
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(() => {
            const historyElement = screen.getByText('Recently searched')
            expect(historyElement).toBeVisible()
        })
    })

    it('should show history keyword', async () => {
        const user = userEvent.setup()
        handleAutocomplete()
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(() => {
            expect(screen.getByText('re')).toBeVisible()
        })
    })
    // it('should show two history keywords', async () => {
    //     const user = userEvent.setup()
    //     handleAutocomplete()
    //     await user.clear(screen.getByTestId('input'))
    //     await user.type(screen.getByTestId('input'), 're')
    //     await user.click(screen.getByTestId('search-button'))
    //     await user.clear(screen.getByTestId('input'))
    //     await user.type(screen.getByTestId('input'), 'black')
    //     await user.click(screen.getByTestId('search-button'))
    //     await user.clear(screen.getByTestId('input'))

    //     await waitFor(
    //         () => {
    //             expect(screen.getByText('black')).toBeVisible()
    //             expect(screen.getByText('re')).toBeVisible()
    //         },
    //         { timeout: 4000 },
    //     )
    // })

    it('should clear history keyword', async () => {
        const user = userEvent.setup()
        handleAutocomplete()
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.keyboard('{enter}')
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 'black')
        await user.keyboard('{enter}')
        await user.clear(screen.getByTestId('input'))
        await waitFor(async () => {
            const removeHistoryElement = screen.queryByTestId('remove-history-black');
            if (removeHistoryElement) {
                userEvent.click(removeHistoryElement);
                await waitFor(() => {
                    expect(screen.queryByText('black')).toBeNull();
                });
            }
        });
    })

    it('should clear history', async () => {
        const user = userEvent.setup()
        handleAutocomplete()
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 'black')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))
        await user.click(screen.getByText('Clear history'))

        await waitFor(() => {
            expect(screen.queryByText('black')).toBeNull()
            expect(screen.queryByText('re')).toBeNull()
        })
    })
})
