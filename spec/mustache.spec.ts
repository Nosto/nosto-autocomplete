import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { DefaultState, autocomplete } from '../src'

import '@testing-library/jest-dom'
import { AnyPromise } from '../src/utils/promise'
import {
    fromMustacheTemplate,
    fromRemoteMustacheTemplate,
} from '../src/mustache'

const template = `
<div class="ns-autocomplete-results">
  {{#response.keywords.hits.length}}
    <div class="ns-autocomplete-keywords">
      <div class="ns-autocomplete-header">
        Keywords
      </div>
      {{#response.keywords.hits}}
        <div class="ns-autocomplete-keyword" data-testid="keyword" data-ns-hit="{{toJson}}">
          {{#_highlight.keyword}}
            <span>{{{.}}}</span>
          {{/_highlight.keyword}}
          {{^_highlight.keyword}}
            <span>{{keyword}}</span>
          {{/_highlight.keyword}}
        </div>
      {{/response.keywords.hits}}
    </div>
  {{/response.keywords.hits.length}}

  {{#response.products.hits.length}}
    <div class="ns-autocomplete-products">
      <div class="ns-autocomplete-header">
        Products
      </div>
      {{#response.products.hits}}
        <a class="ns-autocomplete-product" href="{{url}}" data-testid="product" data-ns-hit="{{toJson}}">
          <img
              class="ns-autocomplete-product-image"
              src="{{#imageUrl}}{{ imageUrl }}{{/imageUrl}}{{^imageUrl}}{{ imagePlaceholder }}{{/imageUrl}}"
              alt="{{name}}"
              width="60"
              height="40"
          />
          <div class="ns-autocomplete-product-info">
            {{#brand}}
              <div class="ns-autocomplete-product-brand">
                {{.}}
              </div>
            {{/brand}}
            <div class="ns-autocomplete-product-name">
              {{name}}
            </div>
            <div>
              <span>
                {{price}}&euro;
              </span>
              {{#listPrice}}
                <span class="ns-autocomplete-product-list-price">
                  {{.}}&euro;
                </span>
              {{/listPrice}}
            </div>
          </div>
        </a>
      {{/response.products.hits}}
    </div>
  {{/response.products.hits.length}}

  {{#history.length}}
    <div class="ns-autocomplete-history">
      <div class="ns-autocomplete-header">
        Recently searched
      </div>
      {{#history}}
        <div class="ns-autocomplete-history-item" data-testid="history" data-ns-hit="{{toJson}}">
          {{item}}
          <a href="javascript:void(0)" class="ns-autocomplete-history-item-remove" data-ns-remove-history="{{item}}">
            &#x2715;
          </a>
        </div>
      {{/history}}
    </div>
    <div class="ns-autocomplete-history-clear">
      <button type="button" class="ns-autocomplete-button" data-ns-remove-history="all">
        Clear history
      </button>
    </div>
  {{/history.length}}

  {{#response.keywords.hits.length}}{{#response.products.hits.length}}
    <div class="ns-autocomplete-submit">
      <button type="submit" class="ns-autocomplete-button">
        See all search results
      </button>
    </div>
  {{/response.products.hits.length}}{{/response.keywords.hits.length}}
</div>
`

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
        render: fromMustacheTemplate(template),
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

    const mustacheScript = document.createElement('script')
    mustacheScript.src = 'https://unpkg.com/mustache@4.2.0/mustache.min.js'
    document.body.appendChild(mustacheScript)

    const script = document.createElement('script')
    script.src = 'https://connect.nosto.com/include/shopify-9758212174'
    script.onload = () => {
        w.nosto.reload({ site: location.hostname, searchEnabled: false })
    }
    document.body.appendChild(script)
}

describe('fromMustacheTemplate', () => {
    beforeAll(() => {
        setup()
    })

    afterAll(() => {
        jest.restoreAllMocks()
        document.body.innerHTML = ''
    })

    it('uses local mustache template', async () => {
        const user = userEvent.setup()

        await waitFor(
            () => {
                return handleAutocomplete()
            },
            { timeout: 2000 },
        )

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

describe('fromRemoteMustacheTemplate', () => {
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

        const mockUrl = 'template.mustache'
        const render = fromRemoteMustacheTemplate(mockUrl)

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
                fromMustacheTemplate(template)(
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
                expect(screen.getByText('black')).toHaveClass('selected')
            })
        })
    })
})
