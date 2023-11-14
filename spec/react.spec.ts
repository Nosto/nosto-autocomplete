
import {
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { autocomplete } from '../src'
import '@testing-library/jest-dom'
import { Autocomplete } from './components/Autocomplete'

declare global {
    interface Window {
        React?: {
            createElement: (el: any, props: unknown) => unknown
        }
        ReactDOM?: {
            createRoot: (el: HTMLElement) => Root
        }
    }
}

type Root = {
    render: (el: unknown) => void
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

    const resctScript = document.createElement('script')
    resctScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js'
    document.body.appendChild(resctScript)

    const reactDomScript = document.createElement('script')
    reactDomScript.src =
        'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
    document.body.appendChild(reactDomScript)

    const babelScript = document.createElement('script')
    babelScript.src = 'https://unpkg.com/babel-standalone@6/babel.min.js'
    document.body.appendChild(babelScript)
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
                reactRoot = window.ReactDOM?.createRoot(container) ?? null
            }
            reactRoot?.render(
                window.React?.createElement(Autocomplete, state as unknown),
            )
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
