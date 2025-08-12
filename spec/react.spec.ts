import { describe, afterEach } from "vitest"
import "@testing-library/jest-dom"
import { Autocomplete } from "../src/react/Autocomplete"
import { createElement } from "react"
import { createRoot, Root } from "react-dom/client"
import { DefaultState } from "../src/utils/state"
import { autocompleteSuite } from "./suites/autocomplete"

let reactRoot: Root | undefined

function render(container: HTMLElement, state: DefaultState) {
    if (!reactRoot) {
        reactRoot = createRoot(container)
    }
    reactRoot.render(
        createElement(Autocomplete, {
            history: state.history,
            response: {
                products: {
                    hits: state.response?.products?.hits ?? []
                },
                keywords: {
                    hits: state.response?.keywords?.hits ?? []
                }
            }
        })
    )
}

describe("from react component", () => {
    afterEach(() => {
        reactRoot = undefined
    })

    autocompleteSuite({
        render
    })
})
