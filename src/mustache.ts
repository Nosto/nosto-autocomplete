import { AnyPromise } from "./utils/promise"
import { DefaultState } from "./utils/state"
import Mustache from "mustache"

export { defaultMustacheTemplate } from './defaults/_generated'

/**
 * Render a Mustache template into a container
 *
 * @param template Mustache template
 * @returns render function
 * @group Autocomplete
 * @category Mustache
 */
export function fromMustacheTemplate(template: string, options?: {
    helpers?: object
}) {
    if (Mustache === undefined) {
        throw new Error(
            "Mustache is not defined. Please include the Mustache dependency or library in your page."
        )
    }

    const { helpers } = options || {}

    return (container: HTMLElement, state: object) => {
        container.innerHTML = Mustache.render(template, {
            ...state,
            imagePlaceholder: "https://cdn.nosto.com/nosto/9/mock",
            toJson: function () {
                return JSON.stringify(this)
            },
            showListPrice: function () {
                return this.listPrice !== this.price
            },
            ...helpers
        })

        return AnyPromise.resolve(undefined)
    }
}

/**
 * Load a remote Mustache template and render it into a container
 *
 * @param url remote Mustache template URL
 * @returns render function
 * @group Autocomplete
 * @category Mustache
 */
export function fromRemoteMustacheTemplate<State extends object = DefaultState>(
    url: string,
    options?: {
        helpers?: object
    }
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new AnyPromise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fromMustacheTemplate(xhr.responseText, options)(
                        container,
                        state
                    ).then(() => {
                        resolve(undefined)
                    })
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
