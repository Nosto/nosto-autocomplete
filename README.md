# Nosto Autocomplete

[![typedoc](https://img.shields.io/badge/%F0%9F%93%96-TypeDoc-blue)](https://nosto.github.io/nosto-autocomplete/)
[![npm](https://img.shields.io/npm/v/@nosto/nosto-autocomplete?color=33cd56&logo=npm)](https://www.npmjs.com/package/@nosto/nosto-autocomplete)
[![coverage](https://nosto.github.io/nosto-autocomplete/coverage/badge.svg)](https://nosto.github.io/nosto-autocomplete/coverage/lcov-report/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

**The library is designed to simplify the implementation of Search Autocomplete functionality by providing:**

-   Default autocomplete components and templates.
-   Abstracting Search API requests.
-   Autocomplete component state management.

## 💾 Installation

You can install the `Nosto Autocomplete` library via npm:

```bash
npm install @nosto/nosto-autocomplete
```

The Nosto Autocomplete library can be imported and used in various ways, depending on your preferred framework or template language. Some of the supported import methods include:

-   Base:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete } from "@nosto/nosto-autocomplete"`

-   Mustache:&nbsp; `import { autocomplete, fromMustacheTemplate, defaultMustacheTemplate } from "@nosto/nosto-autocomplete/mustache"`

-   Liquid:&nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete, fromLiquidTemplate, defaultLiquidTemplate } from "@nosto/nosto-autocomplete/liquid"`

-   Preact:&nbsp; &nbsp; &nbsp; &nbsp;`import { autocomplete, Autocomplete } from "@nosto/nosto-autocomplete/preact"`

-   React:&nbsp; &nbsp; &nbsp; &nbsp; `import { autocomplete, Autocomplete } from "@nosto/nosto-autocomplete/react"`

Choose the import method that aligns with your project's requirements and technology stack.

<font size="3">❗Do not combine multiple imports as it will fetch multiple bundles.❗
</font>

## 🔌 Initialization

After installation, you can import and use the library in your JavaScript or TypeScript files.
Library attaches to existing search input element. Once a search input is loaded, `autocomplete` function can initialize event listeners for the Search Autocomplete.

<font size="3">❗`autocomplete` should be called once.❗
</font>

```jsx
import { useEffect } from "react"
import {
    autocomplete,
    search,
    Autocomplete,
} from "@nosto/nosto-autocomplete/react"
import { createRoot } from "react-dom/client"
import "@nosto/nosto-autocomplete/styles.css"

let reactRoot = null

export function Search() {
    useEffect(() => {
        autocomplete({
            fetch: {
                products: {
                    fields: [
                        "name",
                        "url",
                        "imageUrl",
                        "price",
                        "listPrice",
                        "brand",
                    ],
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

                reactRoot.render(<Autocomplete {...state} />)
            },
            submit: async (query, config) => {
                if (query.length >= config.minQueryLength) {
                    const response = await search(
                        {
                            query,
                        },
                        {
                            redirect: true,
                            track: config.nostoAnalytics ? "serp" : undefined,
                        }
                    )
                    // Do something with response. For example, update Search Engine Results Page products state.
                }
            },
        })
    }, [])

    return (
        <form id="search-form">
            <input type="text" id="search" placeholder="search" />
            <button type="submit" id="search-button">
                Search
            </button>
            <div id="search-results" className="ns-autocomplete"></div>
        </form>
    )
}
```

| Property         | Required | Default Value                                                    | Description                                                                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| inputSelector    | Yes      | N/A                                                              | Input element to attach the autocomplete to                                                                                  |
| dropdownSelector | Yes      | N/A                                                              | Dropdown element to attach the autocomplete to (empty container's selector should be provided)                               |
| render           | Yes      | N/A                                                              | Function to render the dropdown                                                                                              |
| fetch            | Yes      | N/A                                                              | Function to fetch the search state                                                                                           |
| submit           | No       | Search API request                                               | Function to submit the search                                                                                                |
| minQueryLength   | No       | `2`                                                              | Minimum length of the query before searching (applied on typing in autocomplete and used in default `submit` implementation) |
| historyEnabled   | No       | `true`                                                           | Enables search history component                                                                                             |
| historySize      | No       | `5`                                                              | Max number of history items to show                                                                                          |
| nostoAnalytics   | No       | `true`                                                           | Enable Nosto Analytics                                                                                                       |
| googleAnalytics  | No       | `{ serpPath: "search", queryParamName: "query", enabled: true }` | Google Analytics configuration. Set to `false` to disable.                                                                   |

</br>

### 🌇 Render results

Once the autocomplete component binds to input via `inputSelector` and `dropdownSelector`, it then renders autocomplete provided in a `render` function. It is called on input focus and change events, and renders a dropdown element with the current search result state:

-   if input is empty and history entries exist, it renders dropdown with history list,
-   if input is not empty and it passes `minQueryLength` rule, it render dropdown with keywords and products.

Render can be adjusted to the desired framework. Moreover, the library provides helpers for Mustache/Liquid template languages.

#### Examples

Suppose `index.html` is

```html
<form id="search-form">
    <input type="text" id="search" placeholder="search" />
    <button type="submit" id="search-button">Search</button>
    <div id="search-results" className="ns-autocomplete"></div>
</form>
```

List of `autocomplete` initialization examples:

1. **Liquid** </br>
   Example below uses `fromLiquidTemplate` helper which renders string template.
   Library provides default autocomplete template via `defaultLiquidTemplate` and default css for default template:

```js
import {
    autocomplete,
    search,
    fromLiquidTemplate,
    defaultLiquidTemplate,
} from "@nosto/nosto-autocomplete/liquid"
import "@nosto/nosto-autocomplete/styles.css"

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
    render: fromLiquidTemplate(defaultLiquidTemplate),
    submit: async (query, config) => {
        if (query.length >= config.minQueryLength) {
            const response = await search(
                {
                    query,
                },
                {
                    redirect: true,
                    track: config.nostoAnalytics ? "serp" : undefined,
                }
            )
            // Do something with response. For example, update Search Engine Results Page products state.
        }
    },
})
```

The template also can be loaded from a file. The library includes a default template, equivalent to string template in above example:

```js
import {
    autocomplete,
    search,
    fromRemoteLiquidTemplate,
} from "@nosto/nosto-autocomplete/liquid"
import "@nosto/nosto-autocomplete/styles.css"

autocomplete({
    // ...
    render: fromRemoteLiquidTemplate(
        `./node_modules/@nosto/nosto-autocomplete/dist/liquid/autocomplete.liquid`
    ),
})
```

2. **Mustache**</br>
   Mustache template is rendered similarly as Liquid template in the above example:

```js
import {
    autocomplete,
    search,
    fromMustacheTemplate,
    defaultMustacheTemplate,
} from "@nosto/nosto-autocomplete/mustache"
import "@nosto/nosto-autocomplete/styles.css"

autocomplete({
    // ...
    render: fromMustacheTemplate(defaultMustacheTemplate),
})
```

Or from a file:

```js
import {
    autocomplete,
    search,
    fromRemoteMustacheTemplate,
} from "@nosto/nosto-autocomplete/mustache"
import "@nosto/nosto-autocomplete/styles.css"

autocomplete({
    // ...
    render: fromRemoteMustacheTemplate(
        `./node_modules/@nosto/nosto-autocomplete/dist/mustache/autocomplete.mustache`
    ),
})
```

3. **React/Preact**</br>
   One way to initialize autocomplete in a React app, is to call `autocomplete` from the `useEffect` on component mount, using default `<Autocomplete />` component and styles:

```jsx
import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import {
    autocomplete,
    search,
    Autocomplete,
} from "@nosto/nosto-autocomplete/react"
import "@nosto/nosto-autocomplete/styles"

let reactRoot = null

export function Search() {
    useEffect(() => {
        autocomplete({
            fetch: {
                products: {
                    fields: [
                        "name",
                        "url",
                        "imageUrl",
                        "price",
                        "listPrice",
                        "brand",
                    ],
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

                reactRoot.render(<Autocomplete {...state} />)
            },
            submit: async (query, config) => {
                if (query.length >= config.minQueryLength) {
                    const response = await search(
                        {
                            query,
                        },
                        {
                            redirect: true,
                            track: config.nostoAnalytics ? "serp" : undefined,
                        }
                    )
                    // Do something with response. For example, update Search Engine Results Page products state.
                }
            },
        })
    }, [])

    return (
        <form id="search-form">
            <input type="text" id="search" placeholder="search" />
            <button type="submit" id="search-button">
                Search
            </button>
            <div id="search-results" className="ns-autocomplete"></div>
        </form>
    )
}
```

The Preact solution does not differ from React a lot:

```jsx
import { render } from "preact/compat"
import { useEffect } from "preact/hooks"
import {
    Autocomplete,
    autocomplete,
    search,
} from "@nosto/nosto-autocomplete/preact"
import "@nosto/nosto-autocomplete/styles.css"

export function Search() {
    useEffect(() => {
        autocomplete({
            // ...
            render: function (container, state) {
                render(<Autocomplete {...state} />, container)
            },
        })
    }, [])

    return <form id="search-form">{/* ... */}</form>
}
```

</br>
</br>

### 🔍 Submit search (Nosto Search api request by default)

When submitting Search results through Autocomplete, `submit` callback is called on these events:

-   **`Enter` key press.**
-   **`Submit button` click.**
-   **`Keyword` click.**

By default `submit` checks if query/keyword length satisfies `minQueryLength`, sends `Search Submit event` to Nosto Analytics and sends Search request to the Nosto Search API.

On usual scenario, you want to render Search Results on submit, so you should override `submit` function:

```js
submit: async (query, config) => {
    if (
        query.length >= config.minQueryLength
    ) {
        const response = await search(
            {
                query,
            },
            {
                redirect: true,
                track: config.nostoAnalytics ? "serp" : undefined,
            }
        )
        // Do something with response. For example, update Search Engine Results Page products state.
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

-   **`serpPath`** - Search query url parameter name

-   **`queryParamName`** - Search query url parameter name

-   **`enabled`** - Enable Google Analytics

For example, if search results URL is https://examplenostoshop.com/search-results?query=shoes, then configuration should be:

```js
googleAnalytics: {
    serpPath: "search-results",
    queryParamName: "query",
    enabled: true
}
```

To disable Google Analytics, set `googleAnalytics: false`.

## 💡 Creating Autocomplete template

The library handles events through `dataset` properties to avoid handling logic in a template. These `data-*` attributes are used:

1. `data-ns-hit` - this attribute should be used on clickable `keyword`, `product`, `history` list elements. Stringified unmodified JSON object (**_product_**, **_keyword_** or **_history_** hit) from the search response should be provided as a value. You will need to escape it in Liquid and Mustache templates.
   <br/>
   This attribute handles submit keyword/history as search, redirect to product, analytics (if enabled) request.

2. `data-ns-remove-history` - should be used to delete history entries in the autocomplete.
   <br/>

-   To make an element delete a single history entry when clicked, add `data-ns-remove-history={hit.item}` to an element.
-   To delete all history entries, add `data-ns-remove-history="all"` to clear button.

Template examples: [Mustache](/src/defaults/autocomplete.mustache), [Liquid](/src/defaults/autocomplete.liquid), [React/Preact](/src/defaults/Autocomplete.tsx)

**_Mustache is based on logic-less templates which can be enhanced with helpers, e.g `toJson`, `imagePlaceholder`, `showListPrice` in [example template](/src/defaults/autocomplete.mustache)_**.

```js
import { fromMustacheTemplate } from '@nosto/nosto-autocomplete/mustache'

fromMustacheTemplate(template, {
    helpers: {
        toJson: function () {
            return JSON.stringify(this)
        },
    },
})
```

## Further reading

See [library TypeDoc page](https://nosto.github.io/nosto-autocomplete/) to see more detailed documentation of the library.
