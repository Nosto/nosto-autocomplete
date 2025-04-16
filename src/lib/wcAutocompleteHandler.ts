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
  const templateContent = element.querySelector<HTMLScriptElement>("script[autocomplete-template]")?.textContent

  if (!Object.keys(getConfigFromScript(element)).length) {
    throw new Error("NostoAutocomplete: Missing required config.")
  }

  const config = getConfigFromScript(element)
  return await autocomplete({
    ...config,
    render: handler(templateContent ?? defaultTemplate),
  })
}

function getConfigFromScript(element: HTMLElement) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
