import { describe } from "vitest"
import "@testing-library/jest-dom"
import {
    fromHandlebarsTemplate,
    defaultHandlebarsTemplate as handlebarsTemplate
} from "../src/handlebars/fromHandlebarsTemplate"
import { autocompleteSuite } from "./suites/autocomplete"

describe("fromHandlebarsTemplate", () => {
    autocompleteSuite({
        render: fromHandlebarsTemplate(handlebarsTemplate)
    })
})
