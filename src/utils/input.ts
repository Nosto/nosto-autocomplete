import { bindInput as bindInputListeners, type InputBindingCallbacks } from "@nosto/search-js/utils"

export type Callbacks = InputBindingCallbacks & {
  onBlur?: () => void
}


export function disableNativeAutocomplete(target: HTMLInputElement) {
  target.setAttribute("autocomplete", "off")
}

export function bindInput(
  target: HTMLInputElement,
  callbacks: Callbacks
): {
  destroy: () => void
} {
  return bindInputListeners(target, callbacks)
}
