# Nosto Autocomplete

[![Docs](https://img.shields.io/badge/%F0%9F%93%9A-Documentation-pink)](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-autocomplete-using-library/installation)
[![typedoc](https://img.shields.io/badge/%F0%9F%93%96-TypeDoc-blue)](https://nosto.github.io/nosto-autocomplete/)
[![npm](https://img.shields.io/npm/v/@nosto/autocomplete?color=33cd56&logo=npm)](https://www.npmjs.com/package/@nosto/autocomplete)
[![coverage](https://nosto.github.io/nosto-autocomplete/coverage/badge.svg)](https://nosto.github.io/nosto-autocomplete/coverage/lcov-report/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

**The library is designed to simplify the implementation of Search Autocomplete functionality by providing:**

* Autocomplete products, keywords and history visualization
* Automatic bindings to Nosto Search API
* Autocomplete component state management
* Nosto Analytics out of the box, Google Analytics support
* Default Autocomplete components and templates
* Keyboard navigation

## Installation

You can install the `Nosto Autocomplete` library via npm:

```bash
npm install @nosto/autocomplete
```

The Nosto Autocomplete library can be imported and used in various ways, depending on your preferred framework or template language.


| Framework | Import Statement |
|-----------|-----------------|
| Base      | `import { autocomplete } from "@nosto/autocomplete"` |
| Handlebars  | `import { autocomplete, fromHandlebarsTemplate, defaultHandlebarsTemplate } from "@nosto/autocomplete/handlebars"` |
| Liquid    | `import { autocomplete, fromLiquidTemplate, defaultLiquidTemplate } from "@nosto/autocomplete/liquid"` |
| Mustache  | `import { autocomplete, fromMustacheTemplate, defaultMustacheTemplate } from "@nosto/autocomplete/mustache"` |
| Preact    | `import { autocomplete, Autocomplete } from "@nosto/autocomplete/preact"` |
| React     | `import { autocomplete, Autocomplete } from "@nosto/autocomplete/react"` |

Choose the import method that aligns with your project's requirements and technology stack.

❗Do not combine multiple imports as it will fetch multiple bundles.❗

## Documentation

Read [Nosto Techdocs](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-autocomplete-using-library/initialization) for more information on how to use the library.

[Library TypeDoc page](https://nosto.github.io/nosto-autocomplete/) includes detailed library helpers documentation and examples.
