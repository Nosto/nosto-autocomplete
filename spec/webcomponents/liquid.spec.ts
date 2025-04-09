import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultLiquidTemplate as template } from "../../src/liquid/fromLiquidTemplate"
import { webComponentSuite } from "../suites/webcomponents"

describe("Liquid web component", () => {
  webComponentSuite({ template, lang: "liquid" })
})
