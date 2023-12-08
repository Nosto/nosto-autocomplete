import { DefaultState } from "./utils/state"
import { AnyPromise } from "./utils/promise"
// @ts-expect-error: Optional peer dependency
import { Liquid } from "liquidjs"

declare global {
    interface Window {
        liquidjs?: {
            Liquid: {
                new (): {
                    parseAndRenderSync(template: string, state: object): string
                }
            }
        }
    }
}

/**
 * Render a liquid template into a container
 *
 * @param template Liquid template
 * @returns render function
 * @group Autocomplete
 * @category Liquid
 */
export function fromLiquidTemplate<State extends object = DefaultState>(
    template: string
): (container: HTMLElement, state: State) => PromiseLike<void> {
    console.log('Liquid', Liquid)
    console.log('window.liquidjs', window.liquidjs)
    const LiquidFactory = Liquid ?? window?.liquidjs?.Liquid
    const instance = LiquidFactory ? new LiquidFactory() : undefined

    if (instance === undefined) {
        throw new Error(
            "Liquid is not defined. Please include the Liquid library in your page."
        )
    }

    return (container, state) => {
        container.innerHTML = instance.parseAndRenderSync(template, state)

        return AnyPromise.resolve(undefined)
    }
}

/**
 * Load a remote liquid template and render it into a container
 *
 * @param url remote Liquid template URL
 * @returns render function
 * @group Autocomplete
 * @category Liquid
 */
export function fromRemoteLiquidTemplate<State extends object = DefaultState>(
    url: string
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new AnyPromise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fromLiquidTemplate(xhr.responseText)(container, state).then(
                        () => {
                            resolve(undefined)
                        }
                    )
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
