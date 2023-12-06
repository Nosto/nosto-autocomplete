import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import searchResponse from "./response/search.json"

import "@testing-library/jest-dom"
import {
    AutocompleteConfig,
    DefaultState,
    NostoClient,
    autocomplete,
    fromLiquidTemplate,
    fromRemoteLiquidTemplate,
} from "../src/entries/liquid"

interface WindowWithNostoJS extends Window {
    nostojs: jest.Mock<
        unknown,
        [
            callback: (api: {
                search: jest.Mock<ReturnType<NostoClient["search"]>>
                recordSearchSubmit: jest.Mock<
                    ReturnType<NostoClient["recordSearchSubmit"]>
                >
                recordSearchClick: jest.Mock<
                    ReturnType<NostoClient["recordSearchClick"]>
                >
            }) => unknown,
        ]
    >
}

const template = `
    {% assign hasKeywords = response.keywords.hits.length > 0 %}
    {% assign hasProducts = response.products.hits.length > 0 %}
    {% assign hasHistory = history.length > 0 %}

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
                href="javascript:void(0)"
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
                href="javascript:void(0);"
                data-ns-hit="{{ hit | json | escape }}"
                data-testid="product"
            >

                <img
                    class="ns-autocomplete-product-image"
                    src="{{ hit.imageUrl }}"
                    alt="{{ hit.name }}"
                    width="60"
                    height="40"
                 />
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

const handleAutocomplete = async (
    render: AutocompleteConfig<DefaultState>["render"],
    submit: AutocompleteConfig<DefaultState>["submit"] = () => ({})
) => {
    autocomplete({
        fetch: {
            products: {
                fields: [
                    "name",
                    "url",
                    "imageUrl",
                    "price",
                    "listPrice",
                    "brand",
                ],
                size: 5,
            },
            keywords: {
                size: 5,
                fields: ["keyword", "_highlight.keyword"],
                highlight: {
                    preTag: `<strong>`,
                    postTag: "</strong>",
                },
            },
        },
        inputSelector: "#search",
        dropdownSelector: "#search-results",
        render,
        submit,
    })
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const w = window as unknown as WindowWithNostoJS

let searchSpy: jest.Mock<ReturnType<NostoClient["search"]>>
let recordSearchSubmitSpy: jest.Mock<
    ReturnType<NostoClient["recordSearchSubmit"]>
>
let recordSearchClickSpy: jest.Mock<
    ReturnType<NostoClient["recordSearchClick"]>
>

beforeEach(() => {
    document.body.innerHTML = `
    <form id="search-form">
        <input type="text" id="search" placeholder="search" data-testid="input" />
        <button type="submit" data-testid="search-button">Search</button>
        <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
    </form>
`

    const liquidScript = document.createElement("script")
    liquidScript.src =
        "https://cdn.jsdelivr.net/npm/liquidjs@10.9.3/dist/liquid.browser.min.js"
    document.body.appendChild(liquidScript)

    searchSpy = jest.fn(
        () =>
            Promise.resolve(searchResponse) as unknown as ReturnType<
                NostoClient["search"]
            >
    )

    recordSearchSubmitSpy = jest.fn(
        () =>
            Promise.resolve() as unknown as ReturnType<
                NostoClient["recordSearchSubmit"]
            >
    )

    recordSearchClickSpy = jest.fn(
        () =>
            Promise.resolve() as unknown as ReturnType<
                NostoClient["recordSearchClick"]
            >
    )

    w.nostojs = jest.fn(
        (
            callback: (api: {
                search: jest.Mock<ReturnType<NostoClient["search"]>>
                recordSearchSubmit: jest.Mock<
                    ReturnType<NostoClient["recordSearchSubmit"]>
                >
                recordSearchClick: jest.Mock<
                    ReturnType<NostoClient["recordSearchClick"]>
                >
            }) => unknown
        ) =>
            callback({
                search: searchSpy,
                recordSearchSubmit: recordSearchSubmitSpy,
                recordSearchClick: recordSearchClickSpy,
            })
    )
})

afterEach(() => {
    jest.restoreAllMocks()
    const dropdown = screen.getByTestId("dropdown")
    const newElement = dropdown.cloneNode(true)
    dropdown?.parentNode?.replaceChild(newElement, dropdown)
    document.body.innerHTML = ""
})

describe("fromLiquidTemplate", () => {
    it("uses local liquid template", async () => {
        const user = userEvent.setup()

        await waitFor(() => handleAutocomplete(fromLiquidTemplate(template)))

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).not.toBeVisible()
            },
            {
                timeout: 1000,
            }
        )

        await user.type(screen.getByTestId("input"), "black")

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).toBeVisible()

                expect(screen.getByText("Keywords")).toBeVisible()
                expect(screen.getAllByTestId("keyword")).toHaveLength(5)

                expect(screen.getByText("Products")).toBeVisible()
                expect(screen.getAllByTestId("product")).toHaveLength(5)
            },
            {
                timeout: 4000,
            }
        )
    })

    describe("history", () => {
        it("should see results after typing", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")

            await waitFor(
                () => {
                    expect(screen.getByTestId("dropdown")).toBeVisible()

                    expect(screen.getByText("Keywords")).toBeVisible()
                    expect(screen.getAllByTestId("keyword")).toHaveLength(5)

                    expect(screen.getByText("Products")).toBeVisible()
                    expect(screen.getAllByTestId("product")).toHaveLength(5)
                },
                {
                    timeout: 4000,
                }
            )
        })

        it("should see history on empty input", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => {
                const historyElement = screen.getByText("Recently searched")
                return expect(historyElement).toBeVisible()
            })
        })

        it("should show history keyword", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => expect(screen.getByText("black")).toBeVisible())
        })

        it("should navigate and select history keywords with keyboard", async () => {
            const user = userEvent.setup()
            const expectedQuery = "black"
            let exactQuery = ""
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template), query => {
                    exactQuery = query
                })
            )

            await user.type(screen.getByTestId("input"), expectedQuery)
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await user.type(screen.getByTestId("input"), "white")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowup}")
            await user.keyboard("{enter}")

            expect(exactQuery).toBe(expectedQuery)
        })

        it("should show two history keywords", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => expect(screen.getByText("black")).toBeVisible())
            await waitFor(() => expect(screen.getByText("red")).toBeVisible())
        })

        it("should clear history keyword", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.keyboard("{enter}")
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.keyboard("{enter}")
            await user.clear(screen.getByTestId("input"))

            await waitFor(async () => {
                const removeHistoryElement = screen.queryByTestId(
                    "remove-history-black"
                )
                if (removeHistoryElement) {
                    userEvent.click(removeHistoryElement)
                    return waitFor(() =>
                        expect(screen.queryByText("black")).toBeNull()
                    )
                }
            })
        })

        it("should clear history", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.click(screen.getByText("Clear history"))

            await waitFor(() => expect(screen.queryByText("black")).toBeNull())
            await waitFor(() => expect(screen.queryByText("red")).toBeNull())
        })

        it("should highlight history keyword with keyboard navigation", async () => {
            const user = userEvent.setup()
            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => expect(screen.getByText("black")).toBeVisible())
            await waitFor(() => expect(screen.getByText("red")).toBeVisible())

            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowup}")

            await waitFor(() =>
                expect(screen.getByText("black")).toHaveClass("selected")
            )
        })
    })

    describe("analytics", () => {
        it("should record search submit", async () => {
            const user = userEvent.setup()

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))

            await waitFor(() =>
                expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
            )
        })

        it("should record search submit with keyboard", async () => {
            const user = userEvent.setup()

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")
            await user.keyboard("{enter}")

            await waitFor(() =>
                expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
            )
        })

        it("should record search click on keyword click", async () => {
            const user = userEvent.setup()

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.click(screen.getAllByTestId("keyword")?.[0])
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    {
                        _highlight: {
                            keyword: "<strong>black</strong>",
                        },
                        keyword: "black",
                    }
                )
            })
        })

        it("should record search click on product click", async () => {
            const user = userEvent.setup()

            const oldLocation = w.location
            // @ts-expect-error: mock location
            delete w.location
            w.location = { ...oldLocation, assign: jest.fn(() => ({})) }

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")
            await wait(500)
            await user.click(screen.getAllByTestId("product")?.[0])

            await waitFor(() => {
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    {
                        brand: "Brand",
                        imageUrl:
                            "https://cdn.shopify.com/s/files/1/0097/5821/2174/products/Perry-Ellis-mens-Slim-Fit-Washable-Suit-Pant-Suit-Pants-Black-black.jpg?v=1675970770",
                        listPrice: 150,
                        name: "Slim Fit Washable Suit Pant",
                        price: 40,
                        productId: "6853920686158",
                        url: "https://www.perryellis.com/products/slim-fit-washable-suit-pant-black-4isb4316rt-010",
                    }
                )
            })
        })

        it("should record search click on keyword submitted with keyboard", async () => {
            const user = userEvent.setup()

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")
            await wait(500)
            await user.keyboard("{arrowdown}")
            await user.keyboard("{enter}")

            await waitFor(() =>
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    {
                        _highlight: {
                            keyword: "<strong>black</strong>",
                        },
                        keyword: "black",
                    }
                )
            )
        })

        it("should record search click on product submitted with keyboard", async () => {
            const user = userEvent.setup()

            const oldLocation = w.location
            // @ts-expect-error: mock location
            delete w.location
            w.location = { ...oldLocation, assign: jest.fn(() => ({})) }

            await waitFor(() =>
                handleAutocomplete(fromLiquidTemplate(template))
            )

            await user.type(screen.getByTestId("input"), "black")
            await wait(500)
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{enter}")

            await waitFor(() => {
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    {
                        brand: "Brand",
                        imageUrl:
                            "https://cdn.shopify.com/s/files/1/0097/5821/2174/products/Perry-Ellis-mens-Slim-Fit-Washable-Suit-Pant-Suit-Pants-Black-black.jpg?v=1675970770",
                        listPrice: 150,
                        name: "Slim Fit Washable Suit Pant",
                        price: 40,
                        productId: "6853920686158",
                        url: "https://www.perryellis.com/products/slim-fit-washable-suit-pant-black-4isb4316rt-010",
                    }
                )
            })
        })
    })
})

describe("fromRemoteLiquidTemplate", () => {
    it("fetches remote templates url", async () => {
        const openSpy = jest.spyOn(XMLHttpRequest.prototype, "open")
        const sendSpy = jest.spyOn(XMLHttpRequest.prototype, "send")

        const mockUrl = "template.liquid"
        const render = fromRemoteLiquidTemplate(mockUrl)

        const mockXhr = {
            open: jest.fn(),
            send: jest.fn(),
            status: 200,
            responseText: template,
            onload: jest.fn(),
            onerror: jest.fn(),
        }

        openSpy.mockImplementation((method, url) => {
            if (url === mockUrl) {
                return mockXhr.open(method, url)
            }
            return openSpy.mock.calls[0]
        })

        sendSpy.mockImplementation(() => {
            return sendSpy.mock.calls[0]
        })

        await waitFor(() => handleAutocomplete(render))

        await waitFor(
            () => {
                expect(openSpy).toHaveBeenCalledWith("GET", mockUrl)
                expect(sendSpy).toHaveBeenCalled()
            },
            {
                timeout: 1000,
            }
        )
    })
})
