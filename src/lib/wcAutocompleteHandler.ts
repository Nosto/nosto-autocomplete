import { autocomplete, AutocompleteInstance } from "./autocomplete"
import type { AutocompleteConfig } from "./config"
import type { DefaultState } from "../index"


type TemplateProps = {
  handler: (
    template: string,
  ) => AutocompleteConfig<DefaultState>["render"]
  defaultTemplate: string
}

export async function initAutocomplete(
  element: HTMLElement,
  { handler, defaultTemplate }: TemplateProps,
): Promise<AutocompleteInstance> {
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
    render: handler(templateElement?.innerText ?? defaultTemplate),
  })
}

function getConfigFromScript(element: HTMLElement) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
