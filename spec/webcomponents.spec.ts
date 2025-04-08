import { describe, beforeEach, Mock, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { NostoAutocomplete as NostoAutocompleteHandlebars } from "../src/handlebars/NostoAutocomplete"
import { defaultHandlebarsTemplate as handlebarsTemplate } from "../src/handlebars/fromHandlebarsTemplate"
import { screen, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom"
import { DefaultState } from "../src"
import { getDefaultConfig } from "../src/lib/config"
import type { API, SearchResult } from "@nosto/nosto-js/client"
import { mockNostojs } from "@nosto/nosto-js/testing"
import searchResponse from "./responses/search.json"

type MockSearch = Mock<API["search"]>
type MockRecordSearchSubmit = Mock<API["recordSearchSubmit"]>
type MockRecordSearchClick = Mock<API["recordSearchClick"]>

describe("Handlebars supported web component wrapper", () => {
  let searchSpy: MockSearch
  let recordSearchSubmitSpy: MockRecordSearchSubmit
  let recordSearchClickSpy: MockRecordSearchClick

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
      },
    },
    submit: getDefaultConfig<DefaultState>().submit,
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
    searchSpy = vi.fn(async () => searchResponse as unknown as SearchResult)
    recordSearchSubmitSpy = vi.fn()
    recordSearchClickSpy = vi.fn()
    mockNostojs({
      search: searchSpy,
      recordSearchSubmit: recordSearchSubmitSpy,
      recordSearchClick: recordSearchClickSpy,
    })
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
    const templateEl = document.querySelector("template")!
    templateEl.innerText = `
    <div data-testid="custom-template">
     ${handlebarsTemplate}
    </div>
    `

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

    await user.type(screen.getByTestId("input"), "black")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()
      },
      {
        timeout: 4000,
      }
    )
    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()

        expect(screen.getByText("Keywords")).toBeVisible()
        expect(screen.getAllByTestId("keyword")).toHaveLength(5)

        expect(screen.getByText("Products")).toBeVisible()
        expect(screen.getAllByTestId("product")).toHaveLength(5)
      },
      {
        timeout: 4000,
      }
    )

    await waitFor(() =>
      expect(screen.getByTestId("custom-template")).toBeTruthy()
    )
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

    await user.type(screen.getByTestId("input"), "black")

    await waitFor(
      () => {
        expect(screen.getByTestId("dropdown")).toBeVisible()
      },
      {
        timeout: 4000,
      }
    )
    await waitFor(() => {
      expect(
        screen
          .getByTestId("dropdown")
          .querySelector(".ns-autocomplete-keywords")
      ).toBeTruthy()
      expect(
        screen
          .getByTestId("dropdown")
          .querySelector(".ns-autocomplete-products")
      ).toBeTruthy()
    })
  })
})
