import { initAutocomplete } from "../lib/components"
import {
  fromHandlebarsTemplate,
  defaultHandlebarsTemplate,
} from "./fromHandlebarsTemplate"

/**
 * Nosto Autocomplete Web Component using Handlebars templates.
 *
 * This component integrates the Nosto Autocomplete functionality with Handlebars templating.
 * It fetches the configuration from a script tag, compiles the Handlebars template,
 * and initializes the autocomplete with the compiled template as the render function.
 * If a custom template isn't passed, the component will use the default Handlebars template.
 *
 * @example
 * ```html
 * <nosto-autocomplete>
 *   <form>
 *     <input type="text" id="input" />
 *     <div id="results"></div>
 *   </form>
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
 *   <script type="text/x-handlebars-template" autocomplete-template>
 *     <h1>{{query}}</h1>
 *     <ul>
 *       {{#each products}}
 *         <li>{{name}}</li>
 *       {{/each}}
 *     </ul>
 *   </script>
 * </nosto-autocomplete>
 * ```
 */
export class NostoAutocomplete extends HTMLElement {
  async connectedCallback() {
    return initAutocomplete(this, {
      handler: fromHandlebarsTemplate,
      defaultTemplate: defaultHandlebarsTemplate,
    })
  }
}

customElements.define("nosto-autocomplete", NostoAutocomplete)
