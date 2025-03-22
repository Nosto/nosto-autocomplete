import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom"
import {
  fromLiquidTemplate,
  fromRemoteLiquidTemplate,
  defaultLiquidTemplate as liquidTemplate,
} from "../src/liquid"
import {
  handleAutocomplete,
  hooks,
  autocompleteSuite,
} from "./suites/autocomplete"
import { waitFor } from "@testing-library/dom"
import { mockFetch } from "./utils"


describe("fromLiquidTemplate", () => {
  autocompleteSuite({
    render: fromLiquidTemplate(liquidTemplate)
  })
})

describe("fromRemoteLiquidTemplate", () => {
  hooks()

  it("fetches remote templates url", async () => {
    const mockUrl = "template.liquid"
    const render = fromRemoteLiquidTemplate(mockUrl)
    mockFetch(mockUrl, liquidTemplate)

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
