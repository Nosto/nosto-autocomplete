import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultMustacheTemplate as template, NostoAutocomplete } from "../../src/mustache"
import { webComponentSuite } from "../suites/webcomponents"

describe("Mustache web component", () => {
  webComponentSuite({ template, component: NostoAutocomplete })
})
