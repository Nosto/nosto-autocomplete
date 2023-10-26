import { AnyPromise } from './utils/promise';
import { DefaultState } from './state';

// define window.Mustache type
declare global {
    interface Window {
        Mustache?: any
    }
}

/**
 * Render a Mustache template into a container
 *
 * @param template Mustache template
 * @returns render function
 * @group Autocomplete
 * @category Mustache
 */
export function fromMustacheTemplate(template: string) {
    if (window.Mustache === undefined) {
        throw new Error(
            'Mustache is not defined. Please include the Mustache library in your page.',
        )
    }

    return (container: HTMLElement, state: object) => {
        container.innerHTML = window.Mustache.render(template, {
            ...state,
            hasKeywords: (state as any )?.response?.keywords?.hits.length,
            hasProducts: (state as any )?.response?.products?.hits.length,
            hasCategories: (state as any )?.response?.categories?.hits.length,
        });

        return AnyPromise.resolve(undefined);
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
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new AnyPromise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fromMustacheTemplate(xhr.responseText)(container, state).then(
                        () => {
                            resolve(undefined)
                        },
                    )
                } else {
                    reject(
                        new Error(
                            `Failed to fetch remote mustache template: ${xhr.statusText}`,
                        ),
                    )
                }
            }
            xhr.onerror = () => {
                reject(
                    new Error(
                        `Failed to fetch remote mustache template: ${xhr.statusText}`,
                    ),
                )
            }
            xhr.send()
        })
    }
}
