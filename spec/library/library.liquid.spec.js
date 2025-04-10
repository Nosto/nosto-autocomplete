import { describe } from "vitest"
import "@testing-library/jest-dom"
import { autocompleteSuite } from "../suites/autocomplete"

import {
  fromLiquidTemplate,
  defaultLiquidTemplate as liquidTemplate,
} from "../../dist/liquid/autocomplete.bundle.mjs"

describe("Liquid library bundle", () => {
  autocompleteSuite({
    render: fromLiquidTemplate(liquidTemplate),
    basic: true,
  })
})
