import { describe, expect, it } from "vitest"
import fs from "fs"
import json from "../package.json"

describe("exports", () => {
  const files = Object.values(json.exports).flatMap(v => (typeof v === "string" ? [v] : Object.values(v)))
  files.push(json.main)
  files.push(json.module)
  files.push(json.source)

  files.forEach(file => {
    it(`${file} should exist`, () => {
      expect(fs.existsSync(file)).toBe(true)
    })
  })
})

describe("externals", () => {
  function verify(file: string, deps: string[]) {
    const content = fs.readFileSync(file, "utf-8")
    deps.forEach(dep => {
      it(`${file} should have external dependency ${dep}`, () => {
        expect(content).toContain(`from "${dep}"`)
      })
    })
  }

  verify("./dist/react/autocomplete.mjs", ["react/jsx-runtime"])
  verify("./dist/liquid/autocomplete.mjs", ["liquidjs"])
  verify("./dist/mustache/autocomplete.mjs", ["mustache"])
  verify("./dist/handlebars/autocomplete.mjs", ["handlebars"])
})
