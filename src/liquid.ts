import { DefaultState } from "./utils/state"
import { Liquid } from "liquidjs"

export { defaultLiquidTemplate } from "./defaults/_generated"

/**
 * Render a liquid template into a container
 *
 * @param template Liquid template
 * @returns Render function
 * @group Autocomplete
 * @category Liquid
 * @example
 * ```js
 * import { fromLiquidTemplate } from "@nosto/autocomplete/liquid";
 *
 * const render = fromLiquidTemplate(`
 *   <div>
 *      <h1>{{title}}</h1>
 *    <ul>
 *    {% for product in products %}
 *     <li>{{product.name}}</li>
 *  {% endfor %}
 *  </ul>
 *  </div>
 *  `);
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
export function fromLiquidTemplate<State extends object = DefaultState>(
    template: string
): (container: HTMLElement, state: State) => PromiseLike<void> {
    const instance = Liquid ? new Liquid() : undefined

    if (instance === undefined) {
        throw new Error(
            "Liquid is not defined. Please include the Liquid library in your page."
        )
    }

    return (container, state) => {
        container.innerHTML = instance.parseAndRenderSync(template, state)

        return Promise.resolve(undefined)
    }
}

/**
 * Load a remote liquid template and render it into a container
 *
 * @param url Remote Liquid template URL
 * @returns Render function
 * @group Autocomplete
 * @category Liquid
 * @example
 * ```js
 * import { fromRemoteLiquidTemplate } from "@nosto/autocomplete/liquid";
 *
 * const render = fromRemoteLiquidTemplate("https://example.com/template.liquid");
 * ```
 */
export function fromRemoteLiquidTemplate<State extends object = DefaultState>(
    url: string
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onload = async () => {
                if (xhr.status === 200) {
                    await fromLiquidTemplate(xhr.responseText)(container, state)
                    resolve(undefined)
                } else {
                    reject(
                        new Error(
                            `Failed to fetch remote liquid template: ${xhr.statusText}`
                        )
                    )
                }
            }
            xhr.onerror = () => {
                reject(
                    new Error(
                        `Failed to fetch remote liquid template: ${xhr.statusText}`
                    )
                )
            }
            xhr.send()
        })
    }
}
