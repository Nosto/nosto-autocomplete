import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultLiquidTemplate as template, NostoAutocomplete } from "../../src/liquid"
import { webComponentSuite } from "../suites/webcomponents"

describe("Liquid web component", () => {
    webComponentSuite({ template, component: NostoAutocomplete })
})
