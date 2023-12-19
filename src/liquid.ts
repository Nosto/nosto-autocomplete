import { DefaultState } from "./utils/state"
import { AnyPromise } from "./utils/promise"
import { Liquid } from "liquidjs"

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
    const instance = Liquid ? new Liquid() : undefined

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

export const defaultLiquidTemplate = `
    {% assign hasKeywords = response.keywords.hits.length > 0 %}
    {% assign hasProducts = response.products.hits.length > 0 %}
    {% assign hasHistory = history.length > 0 %}
    {% assign imagePlaceHolder = 'https://cdn.nosto.com/nosto/9/mock' %}

    <div class="ns-autocomplete-results">
    {% if hasKeywords == false and hasProducts == false and hasHistory %}
        <div class="ns-autocomplete-history">
        <div class="ns-autocomplete-header">
            Recently searched
        </div>
        {% for hit in history %}
            <div class="ns-autocomplete-history-item" data-ns-hit="{{ hit | json | escape }}">
            {{ hit.item }}
            <a
                href="#"
                class="ns-autocomplete-history-item-remove"
                data-ns-remove-history="{{hit.item}}">
                &#x2715;
            </a>
            </div>
        {% endfor %}
        </div>
        <div class="ns-autocomplete-history-clear">
        <button
            type="button"
            class="ns-autocomplete-button"
            data-ns-remove-history="all">
            Clear history
        </button>
        </div>
    {% elsif hasKeywords or hasProducts %}
        {% if hasKeywords %}
        <div class="ns-autocomplete-keywords">
            <div class="ns-autocomplete-header">
            Keywords
            </div>
            {% for hit in response.keywords.hits %}
            <div class="ns-autocomplete-keyword" data-ns-hit="{{ hit | json | escape }}">
                {% if hit._highlight and hit._highlight.keyword %}
                <span>{{ hit._highlight.keyword }}</span>
                {% else %}
                <span>{{ hit.keyword }}</span>
                {% endif %}
            </div>
            {% endfor %}
        </div>
        {% endif %}
        {% if hasProducts %}
        <div class="ns-autocomplete-products">
            <div class="ns-autocomplete-header">
            Products
            </div>
            {% for hit in response.products.hits %}
            <a
                class="ns-autocomplete-product"
                href="{{ hit.url }}"
                data-ns-hit="{{ hit | json | escape }}">
                <img
                class="ns-autocomplete-product-image"
                src="{% if hit.imageUrl %}{{ hit.imageUrl }}{% else %}{{ imagePlaceHolder }}{% endif %}"
                alt="{{ hit.name }}"
                width="60"
                height="40" />
                <div class="ns-autocomplete-product-info">
                {% if hit.brand %}
                    <div class="ns-autocomplete-product-brand">
                    {{ hit.brand }}
                    </div>
                {% endif %}
                <div class="ns-autocomplete-product-name">
                    {{ hit.name }}
                </div>
                <div>
                    <span>
                    {{ hit.price }}&euro;
                    </span>
                    {% if hit.listPrice %}
                    <span class="ns-autocomplete-product-list-price">
                        {{ hit.listPrice }}
                        &euro;
                    </span>
                    {% endif %}
                </div>
                </div>
            </a>
            {% endfor %}
        </div>
        {% endif %}
        <div class="ns-autocomplete-submit">
        <button type="submit" class="ns-autocomplete-button">
            See all search results
        </button>
        </div>
    {% endif %}
    </div>
`
