import { describe } from "vitest"
import "@testing-library/jest-dom"
import {
  autocompleteSuite
} from "./suites/autocomplete"
import {
  fromHandlebarsTemplate,
  defaultHandlebarsTemplate as handlebarsTemplate,
} from "../dist/handlebars/autocomplete.bundle.mjs"
import {
  fromMustacheTemplate,
  defaultMustacheTemplate as mustacheTemplate,
} from "../dist/mustache/autocomplete.bundle.mjs"
import {
  fromLiquidTemplate,
  defaultLiquidTemplate as liquidTemplate,
} from "../dist/liquid/autocomplete.bundle.mjs"

describe("library bundles", () => {
  describe("fromHandlebarsTemplate", () => {
    autocompleteSuite({
      render: fromHandlebarsTemplate(handlebarsTemplate),
      basic: true
    })
  })
  
  describe("fromMustacheTemplate", () => {
    autocompleteSuite({
      render: fromMustacheTemplate(mustacheTemplate),
      basic: true
    })
  })
  
  describe("fromLiquidTemplate", () => {
    autocompleteSuite({
      render: fromLiquidTemplate(liquidTemplate),
      basic: true
    })
  })
})

