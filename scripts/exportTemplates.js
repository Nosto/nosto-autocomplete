import * as fs from "fs"

// write script that generates const variable string from /src/defaults/autocomplete.liquid
function generateAutocompleteLiquid() {
    const autocompleteLiquidLines = fs
        .readFileSync("./src/defaults/autocomplete.liquid", "utf8")
        .split("\n")
    const autocompleteLiquidLinesWithConst = `export const defaultLiquidTemplate = \`\n${autocompleteLiquidLines
        .map(line => `${line}`)
        .join("\n")}\n\`\n`

    fs.appendFileSync(
        "./src/defaults/_generated.ts",
        autocompleteLiquidLinesWithConst
    )
}

function generateAutocompleteMustache() {
    const autocompleteMustacheLines = fs
        .readFileSync("./src/defaults/autocomplete.mustache", "utf8")
        .split("\n")
    const autocompleteMustacheLinesWithConst = `export const defaultMustacheTemplate = \`\n${autocompleteMustacheLines
        .map(line => `${line}`)
        .join("\n")}\n\`\n`

    fs.appendFileSync(
        "./src/defaults/_generated.ts",
        autocompleteMustacheLinesWithConst
    )
}

if (fs.existsSync("./src/defaults/_generated.ts")) {
    fs.unlinkSync("./src/defaults/_generated.ts")
}

generateAutocompleteLiquid()
generateAutocompleteMustache()
