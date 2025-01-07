/** @hidden */
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
        <div class="ns-autocomplete-history-item" data-ns-hit="{{ hit | json | escape }}" data-testid="history">
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
          <div class="ns-autocomplete-keyword" data-ns-hit="{{ hit | json | escape }}" data-testid="keyword">
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
            data-ns-hit="{{ hit | json | escape }}"
            data-testid="product">
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
                {% if hit.listPrice and hit.listPrice != hit.price %}
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

/** @hidden */
export const defaultMustacheTemplate = `
<div class="ns-autocomplete-results">
  {{#response.keywords.hits.length}}
    <div class="ns-autocomplete-keywords">
      <div class="ns-autocomplete-header">
        Keywords
      </div>
      {{#response.keywords.hits}}
        <div class="ns-autocomplete-keyword" data-ns-hit="{{toJson}}" data-testid="keyword">
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
        <a class="ns-autocomplete-product" href="{{url}}" data-ns-hit="{{toJson}}" data-testid="product">
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
              {{#showListPrice}}
                <span class="ns-autocomplete-product-list-price">
                  {{listPrice}}&euro;
                </span>
              {{/showListPrice}}
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
        <div class="ns-autocomplete-history-item" data-ns-hit="{{toJson}}" data-testid="history">
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
