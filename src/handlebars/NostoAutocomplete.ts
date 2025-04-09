import { autocomplete } from "../lib/autocomplete"
import { fromHandlebarsTemplate, defaultHandlebarsTemplate } from "./fromHandlebarsTemplate"

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
 *     <input type="text" id="search-input" />
 *     <div id="search-results"></div>
 *   </form>
 *   <script autocomplete-config type="application/json">
 *     {
 *       "inputSelector": "#search-input",
 *       "dropdownSelector": "#search-results",
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
 *     <h1>{{query}}</h1>
 *     <ul>
 *       {{#each products}}
 *         <li>{{name}}</li>
 *       {{/each}}
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
    const templateElement = this.querySelector<HTMLTemplateElement>("template")

    if (!Object.keys(this.getConfigFromScript()).length) {
      throw new Error("NostoAutocomplete: Missing required config.")
    }

    const config = this.getConfigFromScript()
    return await autocomplete({
      ...config,
      render: fromHandlebarsTemplate(templateElement?.innerText ?? defaultHandlebarsTemplate)
    })
  }

  private getConfigFromScript() {
    const config = this.querySelector("script[autocomplete-config]")
    return config ? JSON.parse(config.textContent!) : {}
  }
}

customElements.define(
  "nosto-autocomplete",
  NostoAutocomplete
)
