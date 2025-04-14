import { initAutocomplete } from "../lib/wcAutocompleteHandler"
import { fromLiquidTemplate, defaultLiquidTemplate } from "./fromLiquidTemplate"

/**
 * Nosto Autocomplete Web Component using Liquid templates.
 *
 * This component integrates the Nosto Autocomplete functionality with Liquid templating.
 * It fetches the configuration from a script tag, compiles the Liquid template,
 * and initializes the autocomplete with the compiled template as the render function.
 * If a custom template isn't passed, the component will use the default Liquid template.
 *
 * @example
 * ```html
 * <nosto-autocomplete>
 *   <form>
 *     <input type="text" id="input" />
 *   </form>
 *     <div id="results"></div>
 *   <script autocomplete-config type="application/json">
 *     {
 *       "inputSelector": "#input",
 *       "dropdownSelector": "#results",
 *       "fetch": {
 *         "products": {
 *           "fields": ["name", "url", "imageUrl", "price", "listPrice", "brand"],
 *           "size": 5
 *         },
 *         "keywords": {
 *           "size": 5,
 *           "fields": ["keyword", "_highlight.keyword"]
 *         }
 *       }
 *     }
 *   </script>
 *   <template>
 *     <h1>{{ query }}</h1>
 *     <ul>
 *       {% for product in products %}
 *         <li>{{ product.name }}</li>
 *       {% endfor %}
 *     </ul>
 *   </template>
 * </nosto-autocomplete>
 * ```
 */
export class NostoAutocomplete extends HTMLElement {
  constructor() {
    super()
  }

  async connectedCallback() {
    return initAutocomplete(this, {
      handler: fromLiquidTemplate,
      template: defaultLiquidTemplate,
    })
  }
}

customElements.define("nosto-autocomplete", NostoAutocomplete)
