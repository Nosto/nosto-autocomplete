import { autocomplete } from "../lib/autocomplete"
import { fromMustacheTemplate, defaultMustacheTemplate } from "./fromMustacheTemplate"

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
      render: fromMustacheTemplate(templateElement?.innerText ?? defaultMustacheTemplate)
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
