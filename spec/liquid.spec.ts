import { describe } from "vitest"
import "@testing-library/jest-dom"
import {
  fromLiquidTemplate,
  defaultLiquidTemplate as liquidTemplate,
} from "../src/liquid/fromLiquidTemplate"
import {
  autocompleteSuite,
} from "./suites/autocomplete"

describe("fromLiquidTemplate", () => {
  autocompleteSuite({
    render: fromLiquidTemplate(liquidTemplate)
  })
})