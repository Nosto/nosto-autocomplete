import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { autocomplete } from '../src'

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

test('autocomplete', async () => {
    const user = userEvent.setup()

    autocomplete({
        query: {
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
        render: (container) => {
            container.innerHTML = '<div>test</div>'
        },
    })

    await user.type(screen.getByTestId('input'), 'red')

    await waitFor(
        () => {
            expect(screen.getByTestId('dropdown')).toBeVisible()
        },
        {
            timeout: 4000,
        },
    )
})
