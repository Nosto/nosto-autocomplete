import { autocomplete, AutocompleteInstance } from "./autocomplete"
import { NostoAutocomplete } from "../handlebars/NostoAutocomplete"

type TemplateLib = {
  handler: (
    template: string,
    options?: object
  ) => (container: HTMLElement, state: object) => Promise<void> | PromiseLike<void>
  template: string
}

export async function initAutocomplete(
  element: NostoAutocomplete,
  lib: TemplateLib
): Promise<AutocompleteInstance> {
  const { handler, template } = lib
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
    render: handler(templateElement?.innerText ?? template),
  })
}

function getConfigFromScript(element: NostoAutocomplete) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
