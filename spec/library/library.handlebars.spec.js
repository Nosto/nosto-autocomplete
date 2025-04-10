import { describe } from "vitest"
import "@testing-library/jest-dom"
import { autocompleteSuite } from "../suites/autocomplete"
import {
  fromHandlebarsTemplate,
  defaultHandlebarsTemplate as handlebarsTemplate,
} from "../../dist/handlebars/autocomplete.bundle.mjs"

describe("Handlebar library bundle", () => {
  autocompleteSuite({
    render: fromHandlebarsTemplate(handlebarsTemplate),
    basic: true,
  })
})
