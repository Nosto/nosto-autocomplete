import fs from "fs"

const fileName = "src/api/search/generated.ts"
let fileContents = fs.readFileSync(fileName, "utf8")

fileContents = fileContents.replaceAll(/export type (Maybe|InputMaybe|Exact|Make|Incremental).*$/gm, "")
fileContents = fileContents.replaceAll(/InputMaybe<(.+)>;$/gm, "$1")
fileContents = fileContents.replaceAll(/Maybe<(.+)>;$/gm, "$1")
fileContents = fileContents.replaceAll(/Scalars\['(ID|String)'\]\['\w+'\]/gm, "string")
fileContents = fileContents.replaceAll(/Scalars\['Boolean'\]\['\w+'\]/gm, "boolean")
fileContents = fileContents.replaceAll(/Scalars\['(Int|Float)'\]\['\w+'\]/gm, "number")
fileContents = fileContents.replaceAll(/Scalars\['Json'\]\['\w+'\]/gm,  "unknown")
fileContents = fileContents.replaceAll(/Array<(\w+)>/gm,  "$1[]")
fs.writeFileSync(fileName, fileContents.trim())