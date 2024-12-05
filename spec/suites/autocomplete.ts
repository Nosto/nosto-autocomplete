import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import searchResponse from "../responses/search.json"

import "@testing-library/jest-dom"
import {
    AutocompleteConfig,
    DefaultState,
    autocomplete,
} from "../../src/entries/base"
import { getDefaultConfig } from "../../src/config"
import type { API } from "@nosto/nosto-js/client"

interface WindowWithNostoJS extends Window {
    nostojs: jest.Mock<
        unknown,
        [
            callback: (api: {
                search: jest.Mock<ReturnType<API["search"]>>
                recordSearchSubmit: jest.Mock<
                    ReturnType<API["recordSearchSubmit"]>
                >
                recordSearchClick: jest.Mock<
                    ReturnType<API["recordSearchClick"]>
                >
            }) => unknown,
        ]
    >
}

export const handleAutocomplete = async (
    render: AutocompleteConfig<DefaultState>["render"],
    submit?: AutocompleteConfig<DefaultState>["submit"]
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
            // @ts-expect-error missing fields    
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
        submit: submit ?? getDefaultConfig<DefaultState>().submit,
    })
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const w = window as unknown as WindowWithNostoJS

let searchSpy: jest.Mock<ReturnType<API["search"]>>
let recordSearchSubmitSpy: jest.Mock<
    ReturnType<API["recordSearchSubmit"]>
>
let recordSearchClickSpy: jest.Mock<
    ReturnType<API["recordSearchClick"]>
>

export function hooks(libraryScript: () => void) {
    beforeEach(() => {
        document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input" />
            <button type="submit" data-testid="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `

        libraryScript()

        searchSpy = jest.fn(
            () =>
                Promise.resolve(searchResponse) as unknown as ReturnType<
                    API["search"]
                >
        )

        recordSearchSubmitSpy = jest.fn(
            () =>
                Promise.resolve() as unknown as ReturnType<
                    API["recordSearchSubmit"]
                >
        )

        recordSearchClickSpy = jest.fn(
            () =>
                Promise.resolve() as unknown as ReturnType<
                    API["recordSearchClick"]
                >
        )

        w.nostojs = jest.fn(
            (
                callback: (api: {
                    search: jest.Mock<ReturnType<API["search"]>>
                    recordSearchSubmit: jest.Mock<
                        ReturnType<API["recordSearchSubmit"]>
                    >
                    recordSearchClick: jest.Mock<
                        ReturnType<API["recordSearchClick"]>
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
}

export function autocompleteSuite({
    render,
    libraryScript,
}: {
    render: () => AutocompleteConfig<DefaultState>["render"]
    libraryScript: () => void
}) {
    hooks(libraryScript)

    it("renders autocomplete", async () => {
        const user = userEvent.setup()

        await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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
                handleAutocomplete(render(), query => {
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
            await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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
            await waitFor(() => handleAutocomplete(render()))

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

            await waitFor(() => handleAutocomplete(render()))

            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))

            await waitFor(() =>
                expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
            )
        })

        it("should call search with isKeyword=false", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))

            await user.type(screen.getByTestId("input"), "black")
            await user.click(screen.getByTestId("search-button"))

            await waitFor(() =>
                expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
                    track: "serp",
                    redirect: true,
                    isKeyword: false,
                })
            )
        })

        it("should record search submit with keyboard", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.keyboard("{enter}")
                expect(recordSearchSubmitSpy).toHaveBeenCalledWith("black")
            })
        })

        it("should call search with keyboard with isKeyword=false", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.keyboard("{enter}")
                expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
                    track: "serp",
                    redirect: true,
                    isKeyword: false,
                })
            })
        })

        it("should record search click on keyword click", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.click(screen.getAllByTestId("keyword")?.[0])
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    searchResponse.keywords.hits[0]
                )
            })
        })

        it("should call search on keyword click with isKeyword=true", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.click(screen.getAllByTestId("keyword")?.[0])

                expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
                    track: "serp",
                    redirect: false,
                    isKeyword: true,
                })
            })
        })

        it("should record search click on product click", async () => {
            const user = userEvent.setup()

            const assignMock = jest.fn(() => ({}))

            const oldLocation = w.location
            // @ts-expect-error: mock location
            delete w.location
            w.location = { ...oldLocation, assign: assignMock }

            await waitFor(() => handleAutocomplete(render()))
            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.click(screen.getAllByTestId("product")?.[0])
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    searchResponse.products.hits[0]
                )
            })

            assignMock.mockClear()
        })

        it("should record search click on keyword submitted with keyboard", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))

            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.keyboard("{arrowdown}")
                await user.keyboard("{enter}")
                expect(recordSearchClickSpy).toHaveBeenCalledWith(
                    "autocomplete",
                    searchResponse.keywords.hits[0]
                )
            })
        })

        it("should record search click on product submitted with keyboard", async () => {
            const user = userEvent.setup()

            const assignMock = jest.fn(() => ({}))

            const oldLocation = w.location
            // @ts-expect-error: mock location
            delete w.location
            w.location = { ...oldLocation, assign: assignMock }

            await waitFor(() => handleAutocomplete(render()))

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
                    searchResponse.products.hits[0]
                )
            })

            assignMock.mockClear()
        })

        it("should call search when keyword is submitted with keyboard, with isKeyword=true", async () => {
            const user = userEvent.setup()

            await waitFor(() => handleAutocomplete(render()))

            await user.type(screen.getByTestId("input"), "black")

            await waitFor(async () => {
                await user.keyboard("{arrowdown}")
                await user.keyboard("{arrowdown}")
                await user.keyboard("{enter}")

                expect(searchSpy).toHaveBeenCalledWith(expect.anything(), {
                    track: "serp",
                    redirect: false,
                    isKeyword: true,
                })
            })
        })
    })
}
