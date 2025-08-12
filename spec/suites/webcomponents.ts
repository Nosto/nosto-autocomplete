import { beforeEach, Mock, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom"
import { DefaultState } from "../../src"
import { getDefaultConfig } from "../../src/lib/config"
import { mockNostojs } from "@nosto/nosto-js/testing"
import searchResponse from "../responses/search.json"
import type { API, SearchResult } from "@nosto/nosto-js/client"

type MockSearch = Mock<API["search"]>
type MockRecordSearchSubmit = Mock<API["recordSearchSubmit"]>
type MockRecordSearchClick = Mock<API["recordSearchClick"]>

type SuiteProps = {
    template: string
    component: CustomElementConstructor
}

type CustomElement = HTMLElement & { connectedCallback: () => void }

const config = {
    inputSelector: "#search-wc",
    dropdownSelector: "#search-results-wc",
    fetch: {
        products: {
            fields: ["name", "url", "imageUrl", "price", "listPrice", "brand"],
            size: 5
        },
        keywords: {
            size: 5,
            fields: ["keyword", "_highlight.keyword"]
        }
    },
    submit: getDefaultConfig<DefaultState>().submit
}

function webComponentSuiteHooks() {
    let searchSpy: MockSearch
    let recordSearchSubmitSpy: MockRecordSearchSubmit
    let recordSearchClickSpy: MockRecordSearchClick

    beforeEach(() => {
        document.body.innerHTML = `
        <nosto-autocomplete>
          <form>
            <input type="text" id="search-wc" placeholder="search" data-testid="input" />
            <button type="submit" id="search-button">Search</button>
            <div id="search-results-wc" class="ns-autocomplete" data-testid="dropdown"></div>
          </form>
          <script autocomplete-config>${JSON.stringify(config)}</script>
        </nosto-autocomplete>
      `
        searchSpy = vi.fn(async () => searchResponse as unknown as SearchResult)
        recordSearchSubmitSpy = vi.fn()
        recordSearchClickSpy = vi.fn()
        mockNostojs({
            search: searchSpy,
            recordSearchSubmit: recordSearchSubmitSpy,
            recordSearchClick: recordSearchClickSpy
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
        // Clean up the DOM after each test
        document.body.innerHTML = ""
    })
}

export function webComponentSuite({ template, component }: SuiteProps) {
    webComponentSuiteHooks()

    it("should define the custom element", () => {
        expect(customElements.get("nosto-autocomplete")).toBe(component)
    })

    it("should use native submit by default", async () => {
        const fn = vi.fn()
        document.querySelector<HTMLFormElement>("form")!.addEventListener("submit", fn)
        document.querySelector<HTMLElement>("#search-button")?.click()
        await waitFor(() => expect(fn).toHaveBeenCalled(), { timeout: 1000 })
    })

    it("should render autocomplete with the correct config and template", async () => {
        const element = document.querySelector<CustomElement>("nosto-autocomplete")!
        const user = userEvent.setup()
        const templateEl = document.createElement("script")
        templateEl.setAttribute("type", "text/template")
        templateEl.setAttribute("autocomplete-template", "")
        templateEl.textContent = `
    <div data-testid="custom-template">
     ${template}
    </div>
    `
        element.append(templateEl)

        await waitFor(() => element.connectedCallback())

        expect(screen.getByTestId("input")).toHaveAttribute("autocomplete", "off")

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).not.toBeVisible()
            },
            {
                timeout: 1000
            }
        )

        await user.type(screen.getByTestId("input"), "black")

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).toBeVisible()
            },
            {
                timeout: 4000
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
                timeout: 4000
            }
        )

        await waitFor(() => expect(screen.getByTestId("custom-template")).toBeTruthy())
    })

    it("should use the default template if custom template is not supplied", async () => {
        const user = userEvent.setup()
        const element = document.querySelector<CustomElement>("nosto-autocomplete")!
        element.querySelector("script[autocomplete-template]")?.remove()
        await waitFor(() => element.connectedCallback())

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).not.toBeVisible()
            },
            {
                timeout: 1000
            }
        )

        await user.type(screen.getByTestId("input"), "black")

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).toBeVisible()
            },
            {
                timeout: 4000
            }
        )
        await waitFor(() => {
            expect(screen.getByTestId("dropdown").querySelector(".ns-autocomplete-keywords")).toBeTruthy()
            expect(screen.getByTestId("dropdown").querySelector(".ns-autocomplete-products")).toBeTruthy()
        })
    })

    it("should get custom template", async () => {
        const user = userEvent.setup()

        document.body.innerHTML = `
      <nosto-autocomplete>
        <form>
          <input type="text" id="search-wc" placeholder="search" data-testid="input" />
          <button type="submit" id="search-button">Search</button>
          <div id="search-results-wc" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
        <script autocomplete-config>${JSON.stringify(config)}</script>
        <script type="text/template" autocomplete-template>
          <div data-testid="custom-template">
            Custom Template Content
          </div>
        </script>
      </nosto-autocomplete>
      `

        const element = document.querySelector<CustomElement>("nosto-autocomplete")!

        await waitFor(() => element.connectedCallback())
        await user.type(screen.getByTestId("input"), "black")
        await waitFor(() => expect(screen.getByTestId("custom-template")).toHaveTextContent("Custom Template Content"))
    })
}
