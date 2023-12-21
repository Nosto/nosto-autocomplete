import * as fs from "fs"

function generateTemplate(filePath, exportName) {
    const templateLines = fs
        .readFileSync(filePath, "utf8")
        .split("\n")
    const templateLinesWithConst = `export const ${exportName} = \`\n${templateLines
        .map(line => `${line}`)
        .join("\n")}\`\n`

    return templateLinesWithConst;
}

const liquidTemplate = generateTemplate("./src/defaults/autocomplete.liquid", "defaultLiquidTemplate");
const mustacheTemplate = generateTemplate("./src/defaults/autocomplete.mustache", "defaultMustacheTemplate");

fs.writeFileSync(
    "./src/defaults/_generated.ts",
    liquidTemplate + `\n` + mustacheTemplate
);
