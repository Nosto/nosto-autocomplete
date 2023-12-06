import "@testing-library/jest-dom"
import { Autocomplete } from "./components/Autocomplete"
import type React from "react"
import type ReactDOM from "react-dom/client"
import { DefaultState } from '../src/utils/state'
import { autocompleteSuite } from './suites/autocomplete'

interface WindowWithReact extends Window {
    React?: typeof React
    ReactDOM?: typeof ReactDOM
}

let reactRoot: ReactDOM.Root | undefined
const w = window as unknown as WindowWithReact

function libraryScript() {
    const reactScript = document.createElement("script")
    reactScript.src = "https://unpkg.com/react@18/umd/react.production.min.js"
    document.body.appendChild(reactScript)

    const reactDomScript = document.createElement("script")
    reactDomScript.src =
        "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    document.body.appendChild(reactDomScript)

    const babelScript = document.createElement("script")
    babelScript.src = "https://unpkg.com/babel-standalone@6/babel.min.js"
    document.body.appendChild(babelScript)
}

function render (container: HTMLElement, state: DefaultState) {
    if (!reactRoot) {
        reactRoot = w.ReactDOM?.createRoot(container)
    }
    reactRoot?.render(
        w.React?.createElement(Autocomplete, {
            history: state.history,
            response: {
                products: {
                    hits: state.response?.products?.hits ?? [],
                },
                keywords: {
                    hits: state.response?.keywords?.hits ?? [],
                },
            },
        })
    )
}

describe("from react component", () => {
    afterEach(() => {
        reactRoot = undefined
    })

    autocompleteSuite({
        render: () => render,
        libraryScript,
    })
})
