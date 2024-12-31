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

function libraryScript() {
  const liquidScript = document.createElement("script")
  liquidScript.src =
    "https://cdn.jsdelivr.net/npm/liquidjs@10.9.3/dist/liquid.browser.min.js"
  document.body.appendChild(liquidScript)
}

describe("fromLiquidTemplate", () => {
  autocompleteSuite({
    render: () => fromLiquidTemplate(liquidTemplate),
    libraryScript,
  })
})

describe("fromRemoteLiquidTemplate", () => {
  hooks(libraryScript)

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
