import { describe, expect, it, Mock, beforeEach, afterEach, vi } from "vitest"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import searchResponse from "../responses/search.json"

import "@testing-library/jest-dom"
import { AutocompleteConfig, DefaultState, autocomplete } from "../../src"
import { getDefaultConfig } from "../../src/lib/config"
import type { API, SearchResult } from "@nosto/nosto-js/client"
import { mockNostojs } from "@nosto/nosto-js/testing"

type MockSearch = Mock<API["search"]>
type MockRecordSearchSubmit = Mock<API["recordSearchSubmit"]>
type MockRecordSearchClick = Mock<API["recordSearchClick"]>

export const handleAutocomplete = async (
  render: AutocompleteConfig<DefaultState>["render"],
  submit?: AutocompleteConfig<DefaultState>["submit"]
) => {
  autocomplete({
    fetch: {
      products: {
        fields: ["name", "url", "imageUrl", "price", "listPrice", "brand"],
        size: 5,
      },
      // @ts-expect-error missing fields
      keywords: {
        size: 5,
        fields: ["keyword", "_highlight.keyword"],
        highlight: {
          preTag: `<strong>`,
          postTag: "</strong>",
        },
      },
    },
    inputSelector: "#search",
    dropdownSelector: "#search-results",
    render,
    submit: submit ?? getDefaultConfig<DefaultState>().submit,
  })
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let searchSpy: MockSearch
let recordSearchSubmitSpy: MockRecordSearchSubmit
let recordSearchClickSpy: MockRecordSearchClick

export function hooks() {
  beforeEach(() => {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input" />
            <button type="submit" data-testid="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
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
    const dropdown = screen.getByTestId("dropdown")
    const newElement = dropdown.cloneNode(true)
    dropdown?.parentNode?.replaceChild(newElement, dropdown)
    document.body.innerHTML = ""
  })
}

interface SuiteProps {
  render: AutocompleteConfig<DefaultState>["render"]
  basic?: boolean
}

export function autocompleteSuite({ render, basic }: SuiteProps) {
  hooks()

  it("renders autocomplete", async () => {
    const user = userEvent.setup()

    await waitFor(() => handleAutocomplete(render))

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

        expect(screen.getByText("Keywords")).toBeVisible()
        expect(screen.getAllByTestId("keyword")).toHaveLength(5)

        expect(screen.getByText("Products")).toBeVisible()
        expect(screen.getAllByTestId("product")).toHaveLength(5)
      },
      {
        timeout: 4000,
      }
    )
  })

  if (basic) {
    return
  }

  describe("history", () => {
    it("should see results after typing", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.type(screen.getByTestId("input"), "black")

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
    })

    it("should see history on empty input", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await waitFor(() => {
        const historyElement = screen.getByText("Recently searched")
        return expect(historyElement).toBeVisible()
      })
    })

    it("should show history keyword", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await waitFor(() => expect(screen.getByText("black")).toBeVisible())
    })

    it("should navigate and select history keywords with keyboard", async () => {
      const user = userEvent.setup()
      const expectedQuery = "black"
      let exactQuery = ""
      await waitFor(() =>
        handleAutocomplete(render, query => {
          exactQuery = query
        })
      )

      await user.type(screen.getByTestId("input"), expectedQuery)
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await user.type(screen.getByTestId("input"), "white")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowup}")
      await user.keyboard("{enter}")

      expect(exactQuery).toBe(expectedQuery)
    })

    it("should show two history keywords", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "red")
      await user.click(screen.getByTestId("search-button"))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await waitFor(() => expect(screen.getByText("black")).toBeVisible())
      await waitFor(() => expect(screen.getByText("red")).toBeVisible())
    })

    it("should clear history keyword", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "red")
      await user.keyboard("{enter}")
      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.keyboard("{enter}")
      await user.clear(screen.getByTestId("input"))

      await waitFor(async () => {
        const removeHistoryElement = screen.queryByTestId(
          "remove-history-black"
        )
        if (removeHistoryElement) {
          userEvent.click(removeHistoryElement)
          return waitFor(() => expect(screen.queryByText("black")).toBeNull())
        }
      })
    })

    it("should clear history", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "red")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))
      await user.click(screen.getByText("Clear history"))

      await waitFor(() => expect(screen.queryByText("black")).toBeNull())
      await waitFor(() => expect(screen.queryByText("red")).toBeNull())
    })

    it("should highlight history keyword with keyboard navigation", async () => {
      const user = userEvent.setup()
      await waitFor(() => handleAutocomplete(render))

      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "red")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))
      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))
      await user.clear(screen.getByTestId("input"))

      await waitFor(() => expect(screen.getByText("black")).toBeVisible())
      await waitFor(() => expect(screen.getByText("red")).toBeVisible())

      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowup}")

      await waitFor(() =>
        expect(screen.getByText("black")).toHaveClass("selected")
      )
    })
  })

  describe("analytics", () => {
    it("should record search submit", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))

      await user.type(screen.getByTestId("input"), "black")
      await user.click(screen.getByTestId("search-button"))

      await waitFor(() =>
        expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
      )
    })

    it("should record search submit with keyboard", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))
      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.keyboard("{enter}")
        expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
      })
    })

    it("should record search click on keyword click", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))
      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.click(screen.getAllByTestId("keyword")?.[0])
        expect(recordSearchClickSpy).toHaveBeenCalledWith(
          "autocomplete",
          searchResponse.keywords.hits[0]
        )
      })
    })

    it("should call search on keyword click with isKeyword=true", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))
      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.click(screen.getAllByTestId("keyword")?.[0])

        expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
          track: "serp",
          redirect: false,
          isKeyword: true,
        })
      })
    })

    it("should record search click on product click", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))
      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.click(screen.getAllByTestId("product")?.[0])
        expect(recordSearchClickSpy).toHaveBeenCalledWith(
          "autocomplete",
          searchResponse.products.hits[0]
        )
      })
    })

    it("should record search click on keyword submitted with keyboard", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))

      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.keyboard("{arrowdown}")
        await user.keyboard("{enter}")
        expect(recordSearchClickSpy).toHaveBeenCalledWith(
          "autocomplete",
          searchResponse.keywords.hits[0]
        )
      })
    })

    it("should record search click on product submitted with keyboard", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))

      await user.type(screen.getByTestId("input"), "black")
      await wait(500)
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{arrowdown}")
      await user.keyboard("{enter}")

      await waitFor(() => {
        expect(recordSearchClickSpy).toHaveBeenCalledWith(
          "autocomplete",
          searchResponse.products.hits[0]
        )
      })
    })

    it("should call search when keyword is submitted with keyboard, with isKeyword=true", async () => {
      const user = userEvent.setup()

      await waitFor(() => handleAutocomplete(render))

      await user.type(screen.getByTestId("input"), "black")

      await waitFor(async () => {
        await user.keyboard("{arrowdown}")
        await user.keyboard("{arrowdown}")
        await user.keyboard("{enter}")

        expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
          track: "serp",
          redirect: false,
          isKeyword: true,
        })
      })
    })
  })
}
