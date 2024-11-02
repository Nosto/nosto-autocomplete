import { DefaultState } from "./utils/state"
import Mustache from "mustache"

export { defaultMustacheTemplate } from "./defaults/_generated"

type Options = {
  /**
   * Mustache helpers to extend template functionality.
   */
  helpers?: object
}

/**
 * Render a Mustache template into a container
 *
 * @param template Mustache template
 * @param options Options object.
 * @returns Render function
 * @group Autocomplete
 * @category Mustache
/**
 * @example
 * ```js
 * import { fromMustacheTemplate } from "@nosto/autocomplete/mustache";
 *
 * const render = fromMustacheTemplate(`
 *   <div>
 *      <h1>{{title}}</h1>
 *     <ul>
 *      {{#products}}
 *       <li>{{name}}</li>
 *     {{/products}}
 *    </ul>
 *   </div>
 *   `, {
 *    helpers: {
 *     toJson: function () {
 *      return JSON.stringify(this)
 *    }});
 *
 * render(document.getElementById("container"), {
 *   title: "My Title",
 *   products: [
 *     { name: "Product 1" },
 *     { name: "Product 2" },
 *     { name: "Product 3" }
 *   ]
 * });
 * ```
 */
export function fromMustacheTemplate<State extends object = DefaultState>(
  template: string,
  options?: Options
) {
  if (Mustache === undefined) {
    throw new Error(
      "Mustache is not defined. Please include the Mustache dependency or library in your page."
    )
  }

  const { helpers } = options || {}

  return (container: HTMLElement, state: State) => {
    container.innerHTML = Mustache.render(template, {
      ...state,
      imagePlaceholder: "https://cdn.nosto.com/nosto/9/mock",
      toJson: function () {
        return JSON.stringify(this)
      },
      showListPrice: function () {
        return this.listPrice !== this.price
      },
      ...helpers,
    })

    return Promise.resolve(undefined)
  }
}

/**
 * Load a remote Mustache template and render it into a container
 *
 * @param url Remote Mustache template URL
 * @returns Render function
 * @group Autocomplete
 * @category Mustache
 * @example
 * ```js
 * import { fromRemoteMustacheTemplate } from "@nosto/autocomplete/mustache";
 *
 * const render = fromRemoteMustacheTemplate("https://example.com/template.mustache");
 * ```
 */
export function fromRemoteMustacheTemplate<State extends object = DefaultState>(
  url: string,
  options?: {
    helpers?: object
  }
): (container: HTMLElement, state: State) => PromiseLike<void> {
  return (container, state) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url)
      xhr.onload = async () => {
        if (xhr.status === 200) {
          await fromMustacheTemplate(xhr.responseText, options)(
            container,
            state
          )
          resolve(undefined)
        } else {
          reject(
            new Error(
              `Failed to fetch remote mustache template: ${xhr.statusText}`
            )
          )
        }
      }
      xhr.onerror = () => {
        reject(
          new Error(
            `Failed to fetch remote mustache template: ${xhr.statusText}`
          )
        )
      }
      xhr.send()
    })
  }
}
