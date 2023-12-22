# Nosto Autocomplete

[![typedoc](https://img.shields.io/badge/%F0%9F%93%96-TypeDoc-blue
)](https://nosto.github.io/nosto-autocomplete/)
[![npm](https://img.shields.io/npm/v/@nosto/nosto-autocomplete?color=33cd56&logo=npm)](https://www.npmjs.com/package/@nosto/nosto-autocomplete)
[![coverage](https://nosto.github.io/nosto-autocomplete/coverage/badge.svg)](https://nosto.github.io/nosto-autocomplete/coverage/lcov-report/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

**The library designed to simplify the implementation of Search Autocomplete functionality by providing:**

- Default autocomplete components and templates.
- State management.
- Abstracting Search API requests.

## 💾 Installation

You can install the `Nosto Autocomplete` library via npm:

```bash
npm install @nosto/nosto-autocomplete
```

The Nosto Autocomplete library can be imported and used in various ways, depending on your preferred framework or templating language. Some of the supported import methods include:

- Base:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete } from "@nosto/nosto-autocomplete"`

- Mustache:&nbsp; `import { autocomplete, fromMustacheTemplate, defaultMustacheTemplate } from "@nosto/nosto-autocomplete/mustache"`

- Liquid:&nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete, fromLiquidTemplate, defaultLiquidTemplate } from "@nosto/nosto-autocomplete/liquid"`

- Preact:&nbsp; &nbsp; &nbsp; &nbsp;`import { autocomplete, Autocomplete } from "@nosto/nosto-autocomplete/preact"`

- React:&nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete, Autocomplete } from "@nosto/nosto-autocomplete/react"`

Choose the import method that aligns with your project's requirements and technology stack.


<font size="3">❗Do not combine multiple imports as it will fetch multiple bundles.❗
</font>
## 🔌 Initialization

After installation, you can import and use the library in your JavaScript or TypeScript files:

```js
import { autocomplete, search, Autocomplete } from "@nosto/nosto-autocomplete/react"

let reactRoot;

autocomplete({
    fetch: {
        products: {
            fields: ["name", "url", "imageUrl", "price", "listPrice", "brand"],
            size: 5,
        },
        keywords: {
            size: 5,
            fields: ["keyword", "_highlight.keyword"],
            highlight: {
                preTag: `<strong>`,
                postTag: "</strong>",
            },
        },
    },
    inputSelector: "#search",
    dropdownSelector: "#search-results",
    render: function (container, state) {
        if (!reactRoot) {
            reactRoot = createRoot(container)
        }

        reactRoot.render(
            <StrictMode>
                <Autocomplete {...state} />
            </StrictMode>
        )
    },
    submit: (query, config) => {
        if (
            query.length >=
            (config.minQueryLength ??
                getDefaultConfig<State>().minQueryLength)
        ) {
            search(
                {
                    query,
                },
                {
                    redirect: true,
                    track: config.nostoAnalytics ? "serp" : undefined,
                }
            )
        }
    }
})
```

| Property          | Required | Default Value | Description                                                                                                   |
| ----------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| inputSelector     | Yes      | N/A           | The input element to attach the autocomplete to                                                               |
| dropdownSelector  | Yes      | N/A           | The dropdown element to attach the autocomplete to                                                            |
| render            | Yes      | N/A           | The function to use to render the dropdown                                                                    |
| fetch             | Yes      | N/A           | The function to use to fetch the search state                                                                 |
| submit            | No       | N/A           | The function to use to submit the search                                                                      |
| minQueryLength    | No       | 2             | Minimum length of the query before searching                                                                  |
| historyEnabled    | No       | true          | Enables search history component                                                                              |
| historySize       | No       | 5             | Max number of history items to show                                                                           |
| nostoAnalytics    | No       | true          | Enable Nosto Analytics                                                                                        |
| googleAnalytics   | No       | `{ serpPath: "search", queryParamName: "query", enabled: true }` | Google Analytics configuration. Set to `false` to disable.                                                    |
</br>
### 🌇 Render results
TODO
</br>
</br>
### 🔍 Submit search (Nosto Search api request by default)

On submitting Search results through Autocomplete, `submit` callback is called on these events:

- **`Enter` key press.**
- **`Submit button` click.**
- **`Keyword` click.**

By default `submit` checks if query/keyword length satisfies `minQueryLength`, sends `Search Submit event` to Nosto Analytics and sends Search request to the Nosto Search API.

On usual scenario, you want to render Search Results on submit, so you should override `submit` function:

```js
submit: (query, config) => {
    if (
        query.length >= config.minQueryLength
    ) {
        search(
            {
                query,
            },
            {
                redirect: true,
                track: config.nostoAnalytics ? "serp" : undefined,
            }
        ).then((response) => {
            // Do something with response.
        })
    }
},
```

To disable `submit` pass `undefined` value.
</br>
</br>
### 📊 Nosto Analytics (enabled by default)

Setting `nostoAnalytics: true` will enable Nosto Analytics tracking. Tracking results can be seen in Nosto Dashboard under Search & Categories -> Analytics page.

❗Note: you should additionally add click events on your search results page according to [Nosto Tech Docs](https://docs.nosto.com/techdocs/apis/frontend/js-apis/search#search-product-keyword-click) with `type: serp || category` accordingly to the results page type.❗
</br>
</br>
### 📈 Google Analytics (enabled by default)

By default we send `pageview` events to existing GA tag, found in shop site. 
To send `pageview` events with correct search information, a minimal configuration is needed in `googleAnalytics` property.

- **`serpPath`** - Search query url parameter name

- **`queryParamName`** - Search query url parameter name

- **`enabled`** - Enable Google Analytics

For example, if search results URL is https://examplenostoshop.com/search-results?query=shoes, then configuration should be:

```js
googleAnalytics: {
    serpPath: "search-results",
    queryParamName: "query",
    enabled: true
}
```

To disable Google Analytics, set `googleAnalytics: false`.

## Further reading

See [library TypeDoc page](https://nosto.github.io/nosto-autocomplete/) to see more detailed documentation of the library.
