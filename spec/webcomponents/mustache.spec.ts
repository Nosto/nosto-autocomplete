import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultMustacheTemplate as template } from "../../src/mustache/fromMustacheTemplate"
import { webComponentSuite } from "../suites/webcomponents"

describe("Mustache web component", () => {
  webComponentSuite({ template, lang: "mustache" })
})
