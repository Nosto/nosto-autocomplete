import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { autocomplete, fromLiquidTemplate } from '../src'

import '@testing-library/jest-dom'

beforeAll(() => {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input"/>
            <button type="submit" id="search-button">Search</button>
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

afterAll(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
})

const template = `
    {% if response.keywords %}
        <div class="ns-autocomplete-header">
        Keywords
        </div>
        {% for hit in response.keywords.hits %}
        <div class="ns-autocomplete-keyword" data-ns-hit="{{ hit | json | escape }}" data-testid="keyword">
            {{ hit.keyword }}
        </div>
        {% endfor %}
        {% endif %}
        {% if response.products %}
        <div class="ns-autocomplete-header">
        Products
        </div>
        {% for hit in response.products.hits %}
        <a href="{{ hit.url }}" data-ns-hit="{{ hit | json | escape }}" data-testid="product">
            {{ hit.name }}
        </a>
        {% endfor %}
    {% endif %}
`

describe('fromLiquidTemplate', () => {
    it('uses local liquid template', async () => {
        const user = userEvent.setup()

        autocomplete({
            fetch: {
                products: {
                    fields: ['name', 'url', 'imageUrl'],
                    size: 5,
                },
                keywords: {
                    size: 5,
                },
            },
            inputSelector: '#search',
            dropdownSelector: '#search-results',
            render: fromLiquidTemplate(template),
        })

        expect(screen.getByTestId('dropdown')).not.toBeVisible()

        await user.type(screen.getByTestId('input'), 'red')

        await waitFor(
            () => {
                expect(screen.getByTestId('dropdown')).toBeVisible()
            },
            {
                timeout: 4000,
            },
        )

        expect(screen.getByText('Keywords')).toBeVisible()
        expect(screen.getAllByTestId('keyword')).toHaveLength(5)

        expect(screen.getByText('Products')).toBeVisible()
        expect(screen.getAllByTestId('product')).toHaveLength(5)
    })
})

// describe('fromRemoteLiquidTemplate', () => {
//     it('fetches remote liquid template', async () => {
//         const user = userEvent.setup()

//         const XMLHttpRequestMock = jest.fn(() => ({
//             open() {
//                 return undefined
//             },
//             send() {
//                 setTimeout(() => {
//                     this.onload()
//                 }, 100)
//             },
//             readyState: 4,
//             status: 200,
//             responseText: template,
//             onload() {}
//         }))

//         autocomplete({
//             fetch: {
//                 products: {
//                     fields: ['name', 'url', 'imageUrl'],
//                     size: 5,
//                 },
//                 keywords: {
//                     size: 5,
//                 },
//             },
//             inputSelector: '#search',
//             dropdownSelector: '#search-results',
//             render: fromRemoteLiquidTemplate(`template.liquid`)
//         })

//         expect(screen.getByTestId('dropdown')).not.toBeVisible()

//         await user.type(screen.getByTestId('input'), 'red')

//         await waitFor(
//             () => {
//                 expect(screen.getByTestId('dropdown')).toBeVisible()
//             },
//             {
//                 timeout: 4000,
//             },
//         )

//         expect(screen.getByText('Keywords')).toBeVisible()
//         expect(screen.getAllByTestId('keyword')).toHaveLength(5)

//         expect(screen.getByText('Products')).toBeVisible()
//         expect(screen.getAllByTestId('product')).toHaveLength(5)
//     })
// })
