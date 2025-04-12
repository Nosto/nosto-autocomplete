import { autocomplete } from "../lib/autocomplete"
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
    return initAutocomplete(this)
  }
}

async function initAutocomplete(element: NostoAutocomplete) {
  const templateId = element.getAttribute("template")
  const templateElement = templateId
    ? document.getElementById(templateId)
    : element.querySelector<HTMLTemplateElement>("template")

  if (!Object.keys(getConfigFromScript(element)).length) {
    throw new Error("NostoAutocomplete: Missing required config.")
  }

  const config = getConfigFromScript(element)
  return await autocomplete({
    ...config,
    render: fromHandlebarsTemplate(
      templateElement?.innerText ?? defaultHandlebarsTemplate
    ),
  })
}

function getConfigFromScript(element: NostoAutocomplete) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}

customElements.define("nosto-autocomplete", NostoAutocomplete)
