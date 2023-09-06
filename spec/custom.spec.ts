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
})

describe('autocomplete', () => {
    it('supports custom fetch function', async () => {
        const user = userEvent.setup()

        autocomplete({
            inputSelector: '#search',
            dropdownSelector: '#search-results',
            fetch(input) {
                return Promise.resolve({
                    items: [input, 'blue'],
                })
            },
            render: (container, state) => {
                container.innerHTML = state.items
                    .map((item) => `<div>keyword ${item}</div>`)
                    .join('')
            },
        })

        expect(screen.getByTestId('dropdown')).not.toBeVisible()

        await user.type(screen.getByTestId('input'), 'red')

        await waitFor(() => {
            expect(screen.getByTestId('dropdown')).toBeVisible()
        })

        expect(screen.getByText('keyword red')).toBeVisible()
        expect(screen.getByText('keyword blue')).toBeVisible()
    })
})
