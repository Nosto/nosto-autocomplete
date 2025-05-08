import { describe, expect, it, beforeAll, afterAll, vi } from "vitest"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { autocomplete } from "../src/lib/autocomplete"

const objectToHtmlAttribute = (obj: Record<string, unknown>) =>
  JSON.stringify(obj)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

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

describe("autocomplete routing", () => {
  it("supports custom routing function", async () => {
    const user = userEvent.setup()
    const routingHandler = vi.fn()

    autocomplete({
      inputSelector: "#search",
      dropdownSelector: "#search-results",
      fetch(input) {
        return Promise.resolve({
          response: {
            products: [
              { name: "Product1", url: "/product/1", price: 10, listPrice: 15 },
            ],
          },
        })
      },
      routingHandler: routingHandler,
      render: (container, state) => {
        container.innerHTML =
          state?.response?.products?.length > 0
            ? state.response.products
                .map(
                  item =>
                    `<a data-testid="product" data-ns-hit="${objectToHtmlAttribute(item)}">${item.name}</a>`
                )
                .join("")
            : ""
      },
      submit: query => {
        console.log("Submitting search with query: ", query)
      },
    })

    await user.type(screen.getByTestId("input"), "red")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()
      },
      { timeout: 4000 }
    )

    const element = screen.getByText("Product1")
    expect(element).toBeVisible()
    await user.click(element)
    expect(routingHandler).toHaveBeenCalledWith("/product/1")
  })

  it("routes with location if not provided", async () => {
    const user = userEvent.setup()

    const originalLocation = window.location
    const mockLocation = { href: "" }
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
    })

    autocomplete({
      inputSelector: "#search",
      dropdownSelector: "#search-results",
      fetch(input) {
        return Promise.resolve({
          response: {
            products: [
              { name: "Product1", url: "/product/1", price: 10, listPrice: 15 },
            ],
          },
        })
      },
      render: (container, state) => {
        container.innerHTML =
          state?.response?.products?.length > 0
            ? state.response.products
                .map(
                  item =>
                    `<a data-testid="product" data-ns-hit="${objectToHtmlAttribute(item)}">${item.name}</a>`
                )
                .join("")
            : ""
      },
      submit: query => {
        console.log("Submitting search with query: ", query)
      },
    })

    await user.type(screen.getByTestId("input"), "red")

    await waitFor(() => {
      expect(screen.getByTestId("dropdown")).toBeVisible()
    })

    const element = screen.getByText("Product1")
    expect(element).toBeVisible()
    await user.click(element)

    expect(window.location.href).toBe("/product/1")

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })
})
