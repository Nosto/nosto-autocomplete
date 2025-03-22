import { describe, expect, it, beforeAll, afterAll, vi } from "vitest"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { autocomplete } from "../src/autocomplete"
import { mockNostojs } from "@nosto/nosto-js/testing"
import { priceDecorator } from "../src"

beforeAll(() => {
  document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input"/>
            <button type="submit" id="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `
})

afterAll(() => {
  document.body.innerHTML = ""
})

describe("autocomplete", () => {
  it("supports hit decorators", async () => {
    const user = userEvent.setup()

    const render = vi.fn()

    const mockQuery = {
      products: {
        fields: [
            "name",
            "url",
            "imageUrl",
            "price",
            "listPrice",
            "brand",
        ],
        size: 5
      }
    }

    const mockResponse = {
      products: {
        hits: [
          {
            name: "red shirt",
            url: "https://example.com/red-shirt",
            imageUrl: "https://example.com/red-shirt.jpg",
            price: 10,
            listPrice: 20,
            brand: "Acme",
          },
          {
            name: "blue shirt",
            url: "https://example.com/blue-shirt",
            imageUrl: "https://example.com/blue-shirt.jpg",
            price: 15,
            listPrice: 25,
            brand: "Acme",
          }
        ]
      }
    } 

    mockNostojs({
      internal: {
        getSettings: () => ({ 
          currencySettings: {
            USD: {
              currencyBeforeAmount: false,
              currencyToken: "$",
              decimalCharacter: ".",
              groupingSeparator: ",",
              decimalPlaces: 2
            }
          }
        })
      },
      search: vi.fn().mockResolvedValue(mockResponse)
    })

    autocomplete({
      inputSelector: "#search",
      dropdownSelector: "#search-results",
      minQueryLength: 0,
      fetch: mockQuery,
      hitDecorators: [
        priceDecorator({ defaultCurrency: "USD" })
      ],
      render
    })

    await user.type(screen.getByTestId("input"), "red")

    expect(render).toHaveBeenLastCalledWith(
      document.querySelector("#search-results"),
      {
        query: {
          ...mockQuery,
          query: "r"
        },
        response: {
          ...mockResponse,
          products: {
            ...mockResponse.products,
            hits: [
              {
                ...mockResponse.products.hits[0],
                priceText: "10.00$",
                listPriceText: "20.00$"
              },
              {
                ...mockResponse.products.hits[1],
                priceText: "15.00$",
                listPriceText: "25.00$"
              }
            ]
          }
        }
      }
    )
  })
})
