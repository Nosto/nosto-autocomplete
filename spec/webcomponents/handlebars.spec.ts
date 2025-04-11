import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultHandlebarsTemplate as template, NostoAutocomplete } from "../../src/handlebars"
import { webComponentSuite } from "../suites/webcomponents"

describe("Handlebars web component", () => {
  webComponentSuite({ template, component: NostoAutocomplete })
})
