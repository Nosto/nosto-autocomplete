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

function libraryScript() {
  const mustacheScript = document.createElement("script")
  mustacheScript.src = "https://unpkg.com/mustache@4.2.0/mustache.min.js"
  document.body.appendChild(mustacheScript)
}

describe("fromMustacheTemplate", () => {
  autocompleteSuite({
    render: () => fromMustacheTemplate(mustacheTemplate),
    libraryScript,
  })
})

describe("fromRemoteMustacheTemplate", () => {
  hooks(libraryScript)

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
