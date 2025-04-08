import { describe, beforeEach, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/dom"
import { NostoAutocomplete as NostoAutocompleteHandlebars } from "../src/handlebars/NostoAutocomplete"
import { defaultHandlebarsTemplate as handlebarsTemplate } from "../src/handlebars/fromHandlebarsTemplate"
import "@testing-library/jest-dom"
// import searchResponse from "./responses/search.json"

describe("Handlebars supported web component wrapper", () => {

  const config = {
    inputSelector: "#search-wc",
    dropdownSelector: "#search-results-wc",
    fetch: {
      products: {
        fields: ["name", "url", "imageUrl", "price", "listPrice", "brand"],
        size: 5,
      },
      keywords: {
        size: 5,
        fields: ["keyword", "_highlight.keyword"],
        highlight: {
          preTag: `<strong>`,
          postTag: "</strong>",
        },
      },
    },
  }

  beforeEach(() => {   
    document.body.innerHTML = `
        <nosto-autocomplete>
          <form>
            <input type="text" id="search-wc" placeholder="search" data-testid="input" />
            <button type="submit" id="search-button">Search</button>
            <div id="search-results-wc" class="ns-autocomplete" data-testid="dropdown"></div>
          </form>
          <script autocomplete-config>${JSON.stringify(config)}</script>
          <template type="text/x-handlebars-template">${handlebarsTemplate}</template>
        </nosto-autocomplete>
      `
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up the DOM after each test
    document.body.innerHTML = ""
  })

  it("should define the custom element", () => {
    expect(customElements.get("nosto-autocomplete")).toBe(
      NostoAutocompleteHandlebars
    )
  })

  it("should render autocomplete with the correct config and template", async () => {
    const user = userEvent.setup()
    const element = document.querySelector(
      "nosto-autocomplete"
    ) as NostoAutocompleteHandlebars
    const scriptElement = element.querySelector("script[autocomplete-config]")
    scriptElement!.textContent = JSON.stringify(config)

    await waitFor(() => element.connectedCallback())

    expect(screen.getByTestId("input")).toHaveAttribute("autocomplete", "off")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).not.toBeVisible()
      },
      {
        timeout: 1000,
      }
    )

    await user.type(screen.getByTestId("input"), "with handlebars")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()
      },
      {
        timeout: 4000,
      }
    )
    expect(screen.getByText("with handlebars")).toBeVisible()
  })

  it("should use the default template if custom template is not supplied", async () => {
    const user = userEvent.setup()
    const element = document.querySelector(
      "nosto-autocomplete"
    ) as NostoAutocompleteHandlebars
    element.querySelector("template")?.remove()
    const scriptElement = element.querySelector("script[autocomplete-config]")
    scriptElement!.textContent = JSON.stringify(config)

    await waitFor(() => element.connectedCallback())

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).not.toBeVisible()
      },
      {
        timeout: 1000,
      }
    )

    await user.type(screen.getByTestId("input"), "with default template")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()
      },
      {
        timeout: 4000,
      }
    )
    expect(screen.getByText("with default template")).toBeVisible()
  })
})
