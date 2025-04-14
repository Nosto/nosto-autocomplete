import { autocomplete, AutocompleteInstance } from "./autocomplete"

type CustomElement = HTMLElement & { connectedCallback: () => void }
type TemplateProps = {
  handler: (
    template: string,
    options?: object
  ) => (container: HTMLElement, state: object) => Promise<void> | PromiseLike<void>
  template: string
}

export async function initAutocomplete(
  element: CustomElement,
  lib: TemplateProps
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

function getConfigFromScript(element: CustomElement) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
