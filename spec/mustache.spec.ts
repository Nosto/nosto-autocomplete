import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom"
import {
  fromMustacheTemplate,
  defaultMustacheTemplate as mustacheTemplate,
} from "../src/mustache/fromMustacheTemplate"
import {
  autocompleteSuite
} from "./suites/autocomplete"
describe("fromMustacheTemplate", () => {
  autocompleteSuite({
    render: fromMustacheTemplate(mustacheTemplate)
  })
})