import { AnyPromise } from "./utils/promise"
import { DefaultState } from "./utils/state"
import Mustache from "mustache"

/**
 * Render a Mustache template into a container
 *
 * @param template Mustache template
 * @returns render function
 * @group Autocomplete
 * @category Mustache
 */
export function fromMustacheTemplate(template: string) {
    if (Mustache === undefined) {
        throw new Error(
            "Mustache is not defined. Please include the Mustache dependency or library in your page."
        )
    }


    return (container: HTMLElement, state: object) => {
        container.innerHTML = Mustache.render(template, {
            ...state,
            imagePlaceholder: "https://cdn.nosto.com/nosto/9/mock",
            toJson: function () {
                return JSON.stringify(this)
            },
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
    url: string
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new AnyPromise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fromMustacheTemplate(xhr.responseText)(
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

export const defaultMustacheTemplate = `
    <div class="ns-autocomplete-results">
    {{#response.keywords.hits.length}}
        <div class="ns-autocomplete-keywords">
        <div class="ns-autocomplete-header">
            Keywords
        </div>
        {{#response.keywords.hits}}
            <div class="ns-autocomplete-keyword" data-ns-hit="{{toJson}}">
            {{#_highlight.keyword}}
                <span>{{{.}}}</span>
            {{/_highlight.keyword}}
            {{^_highlight.keyword}}
                <span>{{keyword}}</span>
            {{/_highlight.keyword}}
            </div>
        {{/response.keywords.hits}}
        </div>
    {{/response.keywords.hits.length}}

    {{#response.products.hits.length}}
        <div class="ns-autocomplete-products">
        <div class="ns-autocomplete-header">
            Products
        </div>
        {{#response.products.hits}}
            <a class="ns-autocomplete-product" href="{{url}}" data-ns-hit="{{toJson}}">
            <img
                class="ns-autocomplete-product-image"
                src="{{#imageUrl}}{{ imageUrl }}{{/imageUrl}}{{^imageUrl}}{{ imagePlaceholder }}{{/imageUrl}}"
                alt="{{name}}"
                width="60"
                height="40"
            />
            <div class="ns-autocomplete-product-info">
                {{#brand}}
                <div class="ns-autocomplete-product-brand">
                    {{.}}
                </div>
                {{/brand}}
                <div class="ns-autocomplete-product-name">
                {{name}}
                </div>
                <div>
                <span>
                    {{price}}&euro;
                </span>
                {{#listPrice}}
                    <span class="ns-autocomplete-product-list-price">
                    {{.}}&euro;
                    </span>
                {{/listPrice}}
                </div>
            </div>
            </a>
        {{/response.products.hits}}
        </div>
    {{/response.products.hits.length}}

    {{#history.length}}
        <div class="ns-autocomplete-history">
        <div class="ns-autocomplete-header">
            Recently searched
        </div>
        {{#history}}
            <div class="ns-autocomplete-history-item" data-ns-hit="{{toJson}}">
            {{item}}
            <a href="#" class="ns-autocomplete-history-item-remove" data-ns-remove-history="{{item}}">
                &#x2715;
            </a>
            </div>
        {{/history}}
        </div>
        <div class="ns-autocomplete-history-clear">
        <button type="button" class="ns-autocomplete-button" data-ns-remove-history="all">
            Clear history
        </button>
        </div>
    {{/history.length}}

    {{#response.keywords.hits.length}}{{#response.products.hits.length}}
        <div class="ns-autocomplete-submit">
        <button type="submit" class="ns-autocomplete-button">
            See all search results
        </button>
        </div>
    {{/response.products.hits.length}}{{/response.keywords.hits.length}}
    </div>
`
