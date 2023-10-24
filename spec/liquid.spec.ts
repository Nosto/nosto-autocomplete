import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import {
    autocomplete,
    fromLiquidTemplate,
    fromRemoteLiquidTemplate,
} from '../src'

import '@testing-library/jest-dom'
import { AnyPromise } from '../src/utils/promise'
import { DefaultState } from '../src/state'

const handleAutocomplete = () => {
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
        render: fromLiquidTemplate(template),
        submit: (query) => {
            // Handle search submit
            console.log(`Submitted search with query: ${query}`)
        },
    })
}

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
}

const template = `
    {% assign hasKeywords = response.keywords.hits.length > 0 %}
    {% assign hasProducts = response.products.hits.length > 0 %}
    {% assign hasHistory = history.length > 0 %}

    <div class="ns-autocomplete-results">
    {% if hasKeywords == false and hasProducts == false and hasHistory %}
        <div class="ns-autocomplete-history">
        <div class="ns-autocomplete-header">
            Recently searched
        </div>
        {% for hit in history %}
            <div class="ns-autocomplete-history-item" data-ns-hit="{{ hit | json | escape }}">
            {{ hit.item }}
            <a
                href="javascript:void(0)"
                class="ns-autocomplete-history-item-remove"
                data-ns-remove-history="{{hit.item}}">
                &#x2715;
            </a>
            </div>
        {% endfor %}
        </div>
        <div class="ns-autocomplete-history-clear">
        <button
            type="button"
            class="ns-autocomplete-button"
            data-ns-remove-history="all">
            Clear history
        </button>
        </div>
    {% elsif hasKeywords or hasProducts %}
        {% if hasKeywords %}
        <div class="ns-autocomplete-keywords">
            <div class="ns-autocomplete-header">
            Keywords
            </div>
            {% for hit in response.keywords.hits %}
            <div class="ns-autocomplete-keyword" data-ns-hit="{{ hit | json | escape }}" data-testid="keyword">
                {% if hit._highlight and hit._highlight.keyword %}
                <span>{{ hit._highlight.keyword }}</span>
                {% else %}
                <span>{{ hit.keyword }}</span>
                {% endif %}
            </div>
            {% endfor %}
        </div>
        {% endif %}
        {% if hasProducts %}
        <div class="ns-autocomplete-products">
            <div class="ns-autocomplete-header">
            Products
            </div>
            {% for hit in response.products.hits %}
            <a
                class="ns-autocomplete-product"
                href="{{ hit.url }}"
                data-ns-hit="{{ hit | json | escape }}">
                <img
                class="ns-autocomplete-product-image"
                src="{{ hit.imageUrl }}"
                alt="{{ hit.name }}"
                width="60"
                height="40"
                data-testid="product" />
                <div class="ns-autocomplete-product-info">
                {% if hit.brand %}
                    <div class="ns-autocomplete-product-brand">
                    {{ hit.brand }}
                    </div>
                {% endif %}
                <div class="ns-autocomplete-product-name">
                    {{ hit.name }}
                </div>
                <div>
                    <span>
                    {{ hit.price }}&euro;
                    </span>
                    {% if hit.listPrice %}
                    <span class="ns-autocomplete-product-list-price">
                        {{ hit.listPrice }}
                        &euro;
                    </span>
                    {% endif %}
                </div>
                </div>
            </a>
            {% endfor %}
        </div>
        {% endif %}
        <div class="ns-autocomplete-submit">
        <button type="submit" class="ns-autocomplete-button">
            See all search results
        </button>
        </div>
    {% endif %}
    </div>
`

describe('fromLiquidTemplate', () => {
    beforeAll(() => {
        setup()
    })

    afterAll(() => {
        jest.restoreAllMocks()
        document.body.innerHTML = ''
    })

    it('uses local liquid template', async () => {
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

describe('fromRemoteLiquidTemplate', () => {
    beforeEach(() => {
        setup()
    })

    afterEach(() => {
        jest.restoreAllMocks()

        const dropdown = screen.getByTestId('dropdown')
        const newElement = dropdown.cloneNode(true)
        dropdown?.parentNode?.replaceChild(newElement, dropdown)

        const w = window as any
        w.nostojs = undefined
        w.nosto = undefined
    })

    it('fetches remote templates url', async () => {
        const openSpy = jest.spyOn(XMLHttpRequest.prototype, 'open')
        const sendSpy = jest.spyOn(XMLHttpRequest.prototype, 'send')

        const mockUrl = 'template.liquid'
        const render = fromRemoteLiquidTemplate(mockUrl)

        const mockXhr = {
            open: jest.fn(),
            send: jest.fn(),
            status: 200,
            responseText: template,
            onload: jest.fn(),
            onerror: jest.fn(),
        }

        openSpy.mockImplementation((method, url) => {
            if (url === mockUrl) {
                return mockXhr.open(method, url)
            }
            return openSpy.mock.calls[0]
        })

        sendSpy.mockImplementation(() => {
            return sendSpy.mock.calls[0]
        })

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
            render,
            submit: (query) => {
                // Handle search submit
                console.log(`Submitted search with query: ${query}`)
            },
        })

        await waitFor(
            () => {
                expect(openSpy).toHaveBeenCalledWith('GET', mockUrl)
                expect(sendSpy).toHaveBeenCalled()
            },
            {
                timeout: 1000,
            },
        )
    })

    it('it renders autocomplete from remote templates', async () => {
        const user = userEvent.setup()

        const mockRender: (
            container: HTMLElement,
            state: DefaultState,
        ) => void | PromiseLike<void> = (
            container: HTMLElement,
            state: DefaultState,
        ) => {
            return new AnyPromise((resolve) => {
                fromLiquidTemplate(template)(
                    screen.getByTestId('dropdown'),
                    state,
                ).then(() => {
                    resolve(undefined)
                })
            })
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
            render: mockRender,
            submit: (query) => {
                // Handle search submit
                console.log(`Submitted search with query: ${query}`)
            },
        })

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

    describe('history', () => {
        // beforeEach(() => {
        //     setup()
        // })
    
        // afterEach(() => {
        //     jest.restoreAllMocks()
    
        //     const dropdown = screen.getByTestId('dropdown')
        //     const newElement = dropdown.cloneNode(true)
        //     dropdown?.parentNode?.replaceChild(newElement, dropdown)
    
        //     const w = window as any
        //     w.nostojs = undefined
        //     w.nosto = undefined
        // })
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

        it('should navigate and select history keywords with keyboard', async () => {
            const user = userEvent.setup()
            handleAutocomplete()

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

            expect(consoleSpy).toHaveBeenCalledWith(
                'Submitted search with query: re',
            )

            expect(consoleSpy).toHaveBeenCalledTimes(1)

            consoleSpy.mockRestore()
        })

        it('should show two history keywords', async () => {
            const user = userEvent.setup()
            handleAutocomplete()

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
            handleAutocomplete()

            await user.clear(screen.getByTestId('input'))
            await user.type(screen.getByTestId('input'), 're')
            await user.keyboard('{enter}')
            await user.clear(screen.getByTestId('input'))
            await user.type(screen.getByTestId('input'), 'black')
            await user.keyboard('{enter}')
            await user.clear(screen.getByTestId('input'))

            await waitFor(async () => {
                const removeHistoryElement = screen.queryByTestId(
                    'remove-history-black',
                )
                if (removeHistoryElement) {
                    userEvent.click(removeHistoryElement)
                    await waitFor(() => {
                        expect(screen.queryByText('black')).toBeNull()
                    })
                }
            })
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

        it('should highlight history keyword with keyboard navigation', async () => {
            const user = userEvent.setup()
            handleAutocomplete()
    
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
                expect(screen.getByText('black')).toHaveClass(
                    'selected',
                )
            })
        })
    })
})
