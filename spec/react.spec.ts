import {
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import {
    AutocompleteConfig,
    DefaultState,
    NostoClient,
    autocomplete,
} from "../src"
import "@testing-library/jest-dom"
import { Autocomplete } from "./components/Autocomplete"
import searchResponse from "./response/search.json"
import type React from "react"
import type ReactDOM from "react-dom/client"

interface WindowWithNostoJS extends Window {
    React?: typeof React
    ReactDOM?: typeof ReactDOM
    nostojs: jest.Mock<
        unknown,
        [
            callback: (api: {
                search: jest.Mock<ReturnType<NostoClient["search"]>>
            }) => unknown,
        ]
    >
}

function setup() {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input" />
            <button type="submit" data-testid="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `

    const resctScript = document.createElement("script")
    resctScript.src = "https://unpkg.com/react@18/umd/react.production.min.js"
    document.body.appendChild(resctScript)

    const reactDomScript = document.createElement("script")
    reactDomScript.src =
        "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    document.body.appendChild(reactDomScript)

    const babelScript = document.createElement("script")
    babelScript.src = "https://unpkg.com/babel-standalone@6/babel.min.js"
    document.body.appendChild(babelScript)
}

const w = window as unknown as WindowWithNostoJS

const handleAutocomplete = (
    submit: AutocompleteConfig<DefaultState>["submit"] = () => ({})
) => {
    let reactRoot: ReactDOM.Root | null = null

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
        render: function (container, state) {
            if (!reactRoot) {
                reactRoot = w.ReactDOM?.createRoot(container) ?? null
            }
            reactRoot?.render(
                w.React?.createElement(Autocomplete, {
                    history: state.history,
                    response: {
                        products: {
                            hits: state.response?.products?.hits ?? [],
                        },
                        keywords: {
                            hits: state.response?.keywords?.hits ?? [],
                        },
                    },
                })
            )
        },
        submit,
    })
}

beforeAll(() => {
    setup()
})

beforeEach(() => {
    const searchSpy = jest.fn(
        () =>
            Promise.resolve(searchResponse) as unknown as ReturnType<
                NostoClient["search"]
            >
    )

    w.nostojs = jest.fn(
        (
            callback: (api: {
                search: jest.Mock<ReturnType<NostoClient["search"]>>
            }) => unknown
        ) =>
            callback({
                search: searchSpy,
            })
    )
})

describe("autocomplete", () => {
    it("renders autocomplete", async () => {
        const user = userEvent.setup()

        handleAutocomplete()

        await waitFor(() =>
            expect(screen.getByTestId("dropdown")).not.toBeVisible()
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
            handleAutocomplete()

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
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => {
                const historyElement = screen.getByText("Recently searched")
                expect(historyElement).toBeVisible()
            })
        })

        it("should show history keyword", async () => {
            const user = userEvent.setup()
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => {
                expect(screen.getByText("black")).toBeVisible()
            })
        })

        it("should navigate and select history keywords with keyboard", async () => {
            const user = userEvent.setup()
            const expectedQuery = "black"
            let exactQuery = ""
            handleAutocomplete(query => {
                exactQuery = query
            })

            await user.type(screen.getByTestId("input"), "black")
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
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(
                () => {
                    expect(screen.getByText("black")).toBeVisible()
                    expect(screen.getByText("red")).toBeVisible()
                },
                { timeout: 4000 }
            )
        })

        it("should clear history keyword", async () => {
            const user = userEvent.setup()
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))

            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => expect(screen.getByText("red")).toBeVisible())
            await waitFor(() => expect(screen.getByText("black")).toBeVisible())

            const blackItem = screen.getByText("black")
            expect(blackItem).toBeInTheDocument()

            const xButton = blackItem.querySelector(
                ".ns-autocomplete-history-item-remove"
            )

            await waitFor(() => expect(xButton).toBeInTheDocument())

            if (xButton) {
                userEvent.click(xButton)

                await waitForElementToBeRemoved(() =>
                    screen.queryByText("black")
                )

                expect(screen.queryByText("black")).toBeNull()
                expect(screen.queryByText("red")).toBeDefined()
            }
        })

        it("should clear history", async () => {
            const user = userEvent.setup()
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.click(screen.getByText("Clear history"))

            await waitFor(() => {
                expect(screen.queryByText("black")).toBeNull()
                expect(screen.queryByText("red")).toBeNull()
            })
        })

        it("should highlight history keyword with keyboard navigation", async () => {
            const user = userEvent.setup()
            handleAutocomplete()

            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "red")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))
            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))
            await user.clear(screen.getByTestId("input"))

            await waitFor(() => {
                expect(screen.getByText("black")).toBeVisible()
                expect(screen.getByText("red")).toBeVisible()
            })

            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowdown}")
            await user.keyboard("{arrowup}")

            await waitFor(() => {
                expect(screen.getByText("black")).toHaveClass("selected")
            })
        })
    })
})
