import { autocomplete } from "./autocomplete"
import type { AutocompleteConfig } from "./config"
import type { DefaultState } from "../index"

type TemplateProps = {
  handler: (template: string) => AutocompleteConfig<DefaultState>["render"]
  defaultTemplate: string
}

export async function initAutocomplete(
  element: HTMLElement,
  { handler, defaultTemplate }: TemplateProps
) {
  const templateContent = element.querySelector<HTMLScriptElement>(
    "script[autocomplete-template]"
  )?.textContent
  
  const config = getConfigFromScript(element)
  if (!Object.keys(config).length) {
    throw new Error("NostoAutocomplete: Missing required config.")
  }
  return autocomplete({
    ...config,
    nativeSubmit: true,
    render: handler(templateContent ?? defaultTemplate),
    submit(value) {
      element.querySelector<HTMLInputElement>(config.inputSelector)!.value = value
      element.querySelector("form")?.submit()
    }
  })
}

function getConfigFromScript(element: HTMLElement) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
