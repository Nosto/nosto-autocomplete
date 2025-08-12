import { DefaultState } from "../utils/state"
import { Liquid } from "liquidjs"

export { default as defaultLiquidTemplate } from "./autocomplete.liquid"

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
        throw new Error("Liquid is not defined. Please include the Liquid library in your page.")
    }

    const tmpl = instance.parse(template)

    return async (container, state) => {
        const result = await instance.render(tmpl, state)
        container.innerHTML = result
    }
}
