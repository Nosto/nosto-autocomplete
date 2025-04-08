import { autocomplete } from "../lib/autocomplete"
import { fromLiquidTemplate, defaultLiquidTemplate } from "./fromLiquidTemplate"

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
      render: fromLiquidTemplate(templateElement?.innerText ?? defaultLiquidTemplate)
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
