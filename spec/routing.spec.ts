import { describe, expect, it, beforeAll, afterAll, vi } from "vitest"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { autocomplete } from "../src/lib/autocomplete"

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

describe("autocomplete dropdown interactions", () => {
  function makeLink(data: { url: string; name: string; id: number }) {
    const link = document.createElement("a")
    link.setAttribute("data-testid", "product")
    link.setAttribute("href", data.url)
    link.setAttribute("data-ns-hit", JSON.stringify(data))
    link.textContent = data.name
    return link
  }

  it("supports custom routing function", async () => {
    const user = userEvent.setup()
    const routingHandler = vi.fn()

    autocomplete({
      inputSelector: "#search",
      dropdownSelector: "#search-results",
      fetch() {
        return Promise.resolve({
          response: {
            products: [
              {
                id: 1,
                name: "Product1",
                url: "/product/1",
                price: 10,
                listPrice: 15,
              },
            ],
          },
        })
      },
      routingHandler: routingHandler,
      render: (container, state) => {
        container.innerHTML = ""
        if (state?.response?.products?.length > 0) {
          state.response.products.forEach(item => {
            container.appendChild(makeLink(item))
          })
        }
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
      fetch() {
        return Promise.resolve({
          response: {
            products: [
              {
                id: 1,
                name: "Product1",
                url: "/product/1",
                price: 10,
                listPrice: 15,
              },
            ],
          },
        })
      },
      render: (container, state) => {
        if (state?.response?.products?.length > 0) {
          container.innerHTML = ""
          if (state?.response?.products?.length > 0) {
            state.response.products.forEach(item => {
              container.appendChild(makeLink(item))
            })
          }
        }
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
