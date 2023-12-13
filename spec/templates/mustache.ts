export default `
    <div class="ns-autocomplete-results">
    {{#response.keywords.hits.length}}
        <div class="ns-autocomplete-keywords">
        <div class="ns-autocomplete-header">
            Keywords
        </div>
        {{#response.keywords.hits}}
            <div class="ns-autocomplete-keyword" data-testid="keyword" data-ns-hit="{{toJson}}">
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
            <a class="ns-autocomplete-product" href="javascript:void(0);" data-testid="product" data-ns-hit="{{toJson}}">
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
            <div class="ns-autocomplete-history-item" data-testid="history" data-ns-hit="{{toJson}}">
            {{item}}
            <a href="javascript:void(0)" class="ns-autocomplete-history-item-remove" data-ns-remove-history="{{item}}">
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