import { DefaultState } from "../utils/state"
import Handlebars from "handlebars"

export { default as defaultHandlebarsTemplate } from "./autocomplete.handlebars"

const defaultOptions = {
    helpers: {
        toJson: function () {
            return JSON.stringify(this)
        },
        showListPrice: function (this: { listPrice: number; price: number }) {
            return this.listPrice !== this.price
        }
    }
}

export type Options = {
    /**
     * Handlebars helpers to extend template functionality.
     */
    helpers?: Record<string, (...args: never[]) => unknown>
}

/**
 * Render a Handlebars template into a container
 *
 * @param template Handlebars template
 * @param options Options object.
 * @returns Render function
 * @group Autocomplete
 * @category Handlebars
/**
 * @example
 * ```js
 * import { fromHandlebarsTemplate } from "@nosto/autocomplete/handlebars";
 *
 * const render = fromHandlebarsTemplate(`
 *   <div>
 *      <h1>{{title}}</h1>
 *     <ul>
 *      {{#each products}}
 *       <li>{{name}}</li>
 *     {{/each}}
 *    </ul>
 *   </div>
 *   `);
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
export function fromHandlebarsTemplate<State extends object = DefaultState>(template: string, options?: Options) {
    if (Handlebars === undefined) {
        throw new Error("Handlebars is not defined. Please include the Handlebars dependency or library in your page.")
    }

    const tmpl = Handlebars.compile(template)

    return (container: HTMLElement, state: State) => {
        container.innerHTML = tmpl(
            {
                ...state,
                imagePlaceholder: "https://cdn.nosto.com/nosto/9/mock"
            },
            options ?? defaultOptions
        )

        return Promise.resolve()
    }
}
