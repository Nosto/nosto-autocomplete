import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom"
import {
  fromMustacheTemplate,
  fromRemoteMustacheTemplate,
  defaultMustacheTemplate as mustacheTemplate,
} from "../src/mustache"
import {
  autocompleteSuite,
  handleAutocomplete,
  hooks,
} from "./suites/autocomplete"
import { waitFor } from "@testing-library/dom"
import { mockFetch } from "./utils"

describe("fromMustacheTemplate", () => {
  autocompleteSuite({
    render: fromMustacheTemplate(mustacheTemplate)
  })
})

describe("fromRemoteMustacheTemplate", () => {
  hooks()

  it("fetches remote templates url", async () => {
    const mockUrl = "template.mustache"
    const render = fromRemoteMustacheTemplate(mockUrl)
    mockFetch(mockUrl, mustacheTemplate)

    await waitFor(() => handleAutocomplete(render))

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(mockUrl)
      },
      {
        timeout: 1000,
      }
    )
  })
})
