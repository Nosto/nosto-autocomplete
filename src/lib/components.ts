import { autocomplete } from "./autocomplete"
import type { AutocompleteConfig } from "./config"
import { DefaultState } from "../utils/state"
import { search } from "./search"
import { getDefaultConfig } from "./config"

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
    render: handler(templateContent ?? defaultTemplate),
    submit: async (query, config, options) => {
      if (
        query.length >=
        (config.minQueryLength ??
          getDefaultConfig<DefaultState>().minQueryLength)
      ) {
        await search(
          {
            query,
          },
          {
            redirect: true,
            track: config.nostoAnalytics ? "serp" : undefined,
            hitDecorators: config.hitDecorators,
            ...options,
          }
        )
       const formElement = element.querySelector("form")
        if (formElement) {
          // TODO: Should the form validity be checked before submit via form.reportValidity()?
          formElement.submit()
        }
      }
    },
  })
}

function getConfigFromScript(element: HTMLElement) {
  const config = element.querySelector("script[autocomplete-config]")
  return config ? JSON.parse(config.textContent!) : {}
}
