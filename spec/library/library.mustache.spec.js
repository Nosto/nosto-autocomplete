import { describe } from "vitest"
import "@testing-library/jest-dom"
import { autocompleteSuite } from "../suites/autocomplete"
import {
  fromMustacheTemplate,
  defaultMustacheTemplate as mustacheTemplate,
} from "../../dist/mustache/autocomplete.bundle.mjs"

describe("Mustache library bundle", () => {
  autocompleteSuite({
    render: fromMustacheTemplate(mustacheTemplate),
    basic: true,
  })
})
