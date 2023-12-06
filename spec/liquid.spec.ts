import "@testing-library/jest-dom"
import {
    fromLiquidTemplate, fromRemoteLiquidTemplate,
} from "../src/entries/liquid"
import { handleAutocomplete, hooks, autocompleteSuite } from './suites/autocomplete'
import liquidTemplate from './templates/liquid'
import { waitFor } from '@testing-library/dom'

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
        const openSpy = jest.spyOn(XMLHttpRequest.prototype, "open")
        const sendSpy = jest.spyOn(XMLHttpRequest.prototype, "send")

        const mockUrl = "template.liquid"
        const render = fromRemoteLiquidTemplate(mockUrl)

        const mockXhr = {
            open: jest.fn(),
            send: jest.fn(),
            status: 200,
            responseText: liquidTemplate,
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
