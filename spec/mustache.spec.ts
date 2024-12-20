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
    const openSpy = jest.spyOn(XMLHttpRequest.prototype, "open")
    const sendSpy = jest.spyOn(XMLHttpRequest.prototype, "send")

    const mockUrl = "template.mustache"
    const render = fromRemoteMustacheTemplate(mockUrl)

    const mockXhr = {
      open: jest.fn(),
      send: jest.fn(),
      status: 200,
      responseText: mustacheTemplate,
      onload: jest.fn(),
      onerror: jest.fn(),
    }

    openSpy.mockImplementation((method, url) => {
      if (url === mockUrl) {
        return mockXhr.open(method, url)
      }
      return openSpy.mock.calls[0]
    })

    sendSpy.mockImplementation(() => {
      return sendSpy.mock.calls[0]
    })

    await waitFor(() => handleAutocomplete(render))

    await waitFor(
      () => {
        expect(openSpy).toHaveBeenCalledWith("GET", mockUrl)
        expect(sendSpy).toHaveBeenCalled()
      },
      {
        timeout: 1000,
      }
    )
  })
})
