import { Liquid } from 'liquidjs'
import { DefaultState } from './state'
import { AnyPromise } from './utils/promise'

const engine = new Liquid()

/**
 * Render a liquid template into a container
 *
 * @param template Liquid template
 * @returns render function
 * @group Autocomplete
 * @category Liquid
 */
export function fromLiquidTemplate<State extends object = DefaultState>(
    template: string,
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        container.innerHTML = engine.parseAndRenderSync(template, state)

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
    url: string,
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new AnyPromise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fromLiquidTemplate(xhr.responseText)(container, state).then(
                        () => {
                            resolve(undefined)
                        },
                    )
                } else {
                    reject(
                        new Error(
                            `Failed to fetch remote liquid template: ${xhr.statusText}`,
                        ),
                    )
                }
            }
            xhr.onerror = () => {
                reject(
                    new Error(
                        `Failed to fetch remote liquid template: ${xhr.statusText}`,
                    ),
                )
            }
            xhr.send()
        })
    }
}
