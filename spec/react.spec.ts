import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import {
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { autocomplete } from '../src'
import '@testing-library/jest-dom'

function setup() {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input" />
            <button type="submit" data-testid="search-button">Search</button>
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

    const babelScript = document.createElement('script')
    babelScript.src = 'https://unpkg.com/babel-standalone@6/babel.min.js'
    document.body.appendChild(babelScript)
    const jsxScript = document.createElement('script')
    jsxScript.type = 'text/babel'
}

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
            }[]
        }
    }
    history?: {
        item: string
    }[]
}

const Autocomplete = ({ response, history }: AutocompleteProps) => {
    setup()
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

    console.log('AUTOCOMPLETE HERE', hasKeywords, hasProducts, hasHistory)

    const renderHistory = () => {
        const jsxScript = document.createElement('script')
        jsxScript.type = 'text/babel'
        return [
            (jsxScript.textContent = `
            <div class="ns-autocomplete-history">
                <div class="ns-autocomplete-header">
                    Recently searched
                </div>
                ${history?.map((hit) => {
                    return `
                        <div
                            class="ns-autocomplete-history-item"
                            data-ns-hit=${JSON.stringify(hit)}
                        >
                            ${hit.item}
                            <a
                                href="javascript:void(0)"
                                class="ns-autocomplete-history-item-remove"
                                data-ns-remove-history=${hit.item}
                            >
                                &#x2715;
                            </a>
                        </div> 
                    `
                })}
            </div>,
            <div class="ns-autocomplete-history-clear">
                <button
                    type="button"
                    class="ns-autocomplete-button"
                    data-ns-remove-history="all"
                >
                    Clear history
                </button>
            </div>`),
        ]
    }

    const renderKeywords = () => {
        const jsxScript = document.createElement('script')
        jsxScript.type = 'text/babel'
        return (jsxScript.textContent = `
            <div className="ns-autocomplete-keywords">
                <div className="ns-autocomplete-header">Keywords</div>
                ${response?.keywords.hits.map(
                    (hit) =>
                        `<div className="ns-autocomplete-keyword" key=${
                            hit.keyword
                        } data-ns-hit=${JSON.stringify(hit)}>
                        ${
                            hit._highlight && hit._highlight.keyword
                                ? `<span dangerouslySetInnerHTML=${{
                                      __html: hit._highlight.keyword,
                                  }}></span>`
                                : `<span>${hit.keyword}</span>
                        `
                        }
                    </div>`,
                )}
            </div>
        `)
    }

    const renderProducts = () => {
        const jsxScript = document.createElement('script')
        jsxScript.type = 'text/babel'
        return (jsxScript.textContent = `
            ${
                hasProducts &&
                `
                <div class="ns-autocomplete-products">
                    <div class="ns-autocomplete-header">
                        Products
                    </div>
                    ${response.products.hits.map((hit) => {
                        return `<a
                                class="ns-autocomplete-product"
                                href=${hit.url}
                                data-ns-hit=${JSON.stringify(hit)}
                            >
                                <img
                                    class="ns-autocomplete-product-image"
                                    src=${hit.imageUrl}
                                    alt=${hit.name}
                                    width="60"
                                    height="40"
                                />
                                <div class="ns-autocomplete-product-info">
                                    ${
                                        hit.brand &&
                                        `<div class="ns-autocomplete-product-brand">
                                            ${hit.brand}
                                        </div>`
                                    }
                                    <div class="ns-autocomplete-product-name">
                                        ${hit.name}
                                    </div>
                                    <div>
                                        <span>
                                            ${hit.price}&euro;
                                        </span>
                                        ${
                                            hit.listPrice &&
                                            `<span class="ns-autocomplete-product-list-price">
                                                ${hit.listPrice}
                                                &euro;
                                            </span>`
                                        }
                                    </div>
                                </div>
                            </a>`
                    })}
                </div>`
            }`)
    }
    const jsxScript = document.createElement('script')
    jsxScript.type = 'text/babel'
    return (jsxScript.textContent = `
        <div className="ns-autocomplete-results">
       ${!hasKeywords && !hasProducts && hasHistory && renderHistory()}
        ${
            (hasKeywords || hasProducts) &&
            `
            <>
                ${renderKeywords()}
                ${renderProducts()}
                <div className="ns-autocomplete-submit">
                    <button
                        type="submit"
                        className="ns-autocomplete-button"
                    >
                        See all search results
                    </button>
                </div>
            </>
            `
        }
    </div>
    `)
}

const handleAutocomplete = () => {
    let reactRoot: Root | null = null
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
            if (!reactRoot) {
                reactRoot = createRoot(container)
            }
            reactRoot.render(React.createElement(Autocomplete))
        },
        submit: (query) => {
            // Handle search submit
            console.log(`Submitted search with query: ${query}`)
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
    beforeEach(() => {
        // Reset the entire DOM and perform necessary setup steps
        document.body.innerHTML = ''
        jest.clearAllMocks()
        setup()
    })

    afterEach(() => {
        // Clean up after each test
        jest.restoreAllMocks()
        const dropdown = screen.getByTestId('dropdown')
        const newElement = dropdown.cloneNode(true)
        dropdown?.parentNode?.replaceChild(newElement, dropdown)
        const w = window as any
        w.nostojs = undefined
        w.nosto = undefined
    })

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
    beforeEach(() => {
        // Reset the entire DOM and perform necessary setup steps
        document.body.innerHTML = ''
        jest.clearAllMocks()
        setup()
    })

    afterEach(() => {
        // Clean up after each test
        jest.restoreAllMocks()
        const dropdown = screen.getByTestId('dropdown')
        const newElement = dropdown.cloneNode(true)
        dropdown?.parentNode?.replaceChild(newElement, dropdown)
        const w = window as any
        w.nostojs = undefined
        w.nosto = undefined
    })

    it('should see results after typing', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

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
        // handleAutocomplete()

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
        // handleAutocomplete()

        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(() => {
            expect(screen.getByText('re')).toBeVisible()
        })
    })

    it('should navigate and select history keywords with keyboard', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

        // Mock console.log
        const consoleSpy = jest.spyOn(console, 'log')

        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await user.type(screen.getByTestId('input'), 'white')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        consoleSpy.mockClear()

        await user.keyboard('{arrowdown}')
        await user.keyboard('{arrowdown}')
        await user.keyboard('{arrowup}')
        await user.keyboard('{enter}')

        waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Submitted search with query: re',
            )

            expect(consoleSpy).toHaveBeenCalledTimes(1)
        })

        consoleSpy.mockRestore()
    })

    it('should show two history keywords', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 'black')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(
            () => {
                expect(screen.getByText('black')).toBeVisible()
                expect(screen.getByText('re')).toBeVisible()
            },
            { timeout: 4000 },
        )
    })

    it('should clear history keyword', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

        await user.clear(screen.getByTestId('input'))

        await user.type(screen.getByTestId('input'), 'black')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(() => expect(screen.getByText('re')).toBeVisible())
        await waitFor(() => expect(screen.getByText('black')).toBeVisible())

        const blackItem = screen.getByText('black')
        expect(blackItem).toBeInTheDocument()

        const xButton = blackItem.querySelector(
            '.ns-autocomplete-history-item-remove',
        )

        await waitFor(() => expect(xButton).toBeInTheDocument())

        if (xButton) {
            userEvent.click(xButton)

            await waitForElementToBeRemoved(() => screen.queryByText('black'))

            expect(screen.queryByText('black')).toBeNull()
            expect(screen.queryByText('re')).toBeDefined()
        }
    })

    it('should clear history', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

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

    it('should highlight history keyword with keyboard navigation', async () => {
        const user = userEvent.setup()
        // handleAutocomplete()

        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 're')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))
        await user.type(screen.getByTestId('input'), 'black')
        await user.click(screen.getByTestId('search-button'))
        await user.clear(screen.getByTestId('input'))

        await waitFor(() => {
            expect(screen.getByText('black')).toBeVisible()
            expect(screen.getByText('re')).toBeVisible()
        })

        await user.keyboard('{arrowdown}')
        await user.keyboard('{arrowdown}')
        await user.keyboard('{arrowup}')

        await waitFor(() => {
            expect(screen.getByText('black')).toHaveClass('selected')
        })
    })
})
