import { describe } from "vitest"
import "@testing-library/jest-dom"
import { defaultHandlebarsTemplate as template } from "../../src/handlebars/fromHandlebarsTemplate"
import { webComponentSuite } from "../suites/webcomponents"

describe("Handlebars web component", () => {
  webComponentSuite({ template, lang: "handlebars" })
})
