# Nosto Autocomplete

[![Docs](https://img.shields.io/badge/%F0%9F%93%9A-Documentation-pink)](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-autocomplete-using-library/installation)
[![typedoc](https://img.shields.io/badge/%F0%9F%93%96-TypeDoc-blue)](https://nosto.github.io/nosto-autocomplete/)
[![npm](https://img.shields.io/npm/v/@nosto/autocomplete?color=33cd56&logo=npm)](https://www.npmjs.com/package/@nosto/autocomplete)
[![coverage](https://nosto.github.io/nosto-autocomplete/coverage/badge.svg)](https://nosto.github.io/nosto-autocomplete/coverage/lcov-report/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

**The library is designed to simplify the implementation of Search Autocomplete functionality by providing:**

&nbsp; &nbsp; &nbsp; 🌟 Autocomplete products, keywords and history visualization.<br/>
&nbsp; &nbsp; &nbsp; 🔄 Automatic bindings to Nosto Search API.<br />
&nbsp; &nbsp; &nbsp; 🧩 Autocomplete component state management.<br />
&nbsp; &nbsp; &nbsp; 📊 Nosto Analytics out of the box, Google Analytics support. <br />
&nbsp; &nbsp; &nbsp; 🏗️ Default Autocomplete components and templates.<br />
&nbsp; &nbsp; &nbsp; 🎮 Keyboard navigation.

## 💾 Installation

You can install the `Nosto Autocomplete` library via npm:

```bash
npm install @nosto/autocomplete
```

The Nosto Autocomplete library can be imported and used in various ways, depending on your preferred framework or template language.


| Framework | Import Statement |
|-----------|-----------------|
| Base      | `import { autocomplete } from "@nosto/autocomplete"` |
| Mustache  | `import { autocomplete, fromMustacheTemplate, defaultMustacheTemplate } from "@nosto/autocomplete/mustache"` |
| Liquid    | `import { autocomplete, fromLiquidTemplate, defaultLiquidTemplate } from "@nosto/autocomplete/liquid"` |
| Preact    | `import { autocomplete, Autocomplete } from "@nosto/autocomplete/preact"` |
| React     | `import { autocomplete, Autocomplete } from "@nosto/autocomplete/react"` |

Choose the import method that aligns with your project's requirements and technology stack.

<font size="3">❗Do not combine multiple imports as it will fetch multiple bundles.❗
</font>

## 📚 Documentation

<font size="3">**Read [Nosto Techdocs](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-autocomplete-using-library/initialization) for more information on how to use the library.**
</font>

***[Library TypeDoc page](https://nosto.github.io/nosto-autocomplete/) includes detailed library helpers documentation and examples.***
