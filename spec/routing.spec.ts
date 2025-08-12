import { describe, expect, it, beforeAll, vi } from "vitest"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { autocomplete } from "../src/lib/autocomplete"
import { AutocompleteConfig } from "../src"

beforeAll(() => {
  document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input"/>
            <button type="submit" id="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `
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

  const response = {
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
  }

  const autocompleteConfig: AutocompleteConfig<typeof response> = {
    inputSelector: "#search",
    dropdownSelector: "#search-results",
    fetch() {
      return Promise.resolve(response)
    },
    render: (container, state) => {
      container.innerHTML = ""
      if (state?.response?.products?.length > 0) {
        state.response.products.forEach(item => {
          container.appendChild(makeLink(item))
        })
      }
    },
  }

  it("supports custom routing function", async () => {
    const user = userEvent.setup()
    const routingHandler = vi.fn()

    autocomplete({
      ...autocompleteConfig,
      routingHandler: url => routingHandler(url),
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

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {},
    })

    autocomplete(autocompleteConfig)

    await user.type(screen.getByTestId("input"), "red")

    await waitFor(() => {
      expect(screen.getByTestId("dropdown")).toBeVisible()
    })

    const element = screen.getByText("Product1")
    expect(element).toBeVisible()
    await user.click(element)

    expect(window.location.href).toBe("/product/1")
  })
})
