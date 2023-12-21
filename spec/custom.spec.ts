import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"

import "@testing-library/jest-dom"
import { SimplePromise } from "../src/utils/promise"
import { autocomplete } from "../src/autocomplete"

beforeAll(() => {
    document.body.innerHTML = `
        <form id="search-form">
            <input type="text" id="search" placeholder="search" data-testid="input"/>
            <button type="submit" id="search-button">Search</button>
            <div id="search-results" class="ns-autocomplete" data-testid="dropdown"></div>
        </form>
    `
})

afterAll(() => {
    document.body.innerHTML = ""
})

describe("autocomplete", () => {
    it("supports custom fetch function", async () => {
        const user = userEvent.setup()

        autocomplete({
            inputSelector: "#search",
            dropdownSelector: "#search-results",
            fetch(input) {
                return Promise.resolve({
                    items: [input, "blue"],
                })
            },
            render: (container, state) => {
                container.innerHTML =
                    state?.items?.length > 0
                        ? state.items
                              .map(item => `<div>keyword ${item}</div>`)
                              .join("")
                        : ""
            },
            submit: query => {
                // Handle search submit
                console.log("Submitting search with query: ", query)
            },
        })

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).not.toBeVisible()
            },
            {
                timeout: 1000,
            }
        )

        await user.type(screen.getByTestId("input"), "red")

        await waitFor(
            () => {
                expect(screen.getByTestId("dropdown")).toBeVisible()
            },
            {
                timeout: 4000,
            }
        )

        expect(screen.getByText("keyword red")).toBeVisible()
        expect(screen.getByText("keyword blue")).toBeVisible()
    })
})

describe("SimplePromise", () => {
    it("has resolve and reject callbacks", async () => {
        const promise = new SimplePromise((resolve, reject) => {
            // expect resolve and reject to be defined and to be functions which acceps one argument
            expect(resolve).toBeDefined()
            expect(reject).toBeDefined()
            expect(typeof resolve).toBe("function")
            expect(typeof reject).toBe("function")

            // resolve promise with value of 1
            setTimeout(() => {
                resolve(1)
            }, 0)
        })

        await promise
    })

    it("resolve() corectly returns value in .then block", async () => {
        const promise = new SimplePromise(resolve => {
            setTimeout(() => {
                resolve("promise")
            }, 0)
        })

        let value
        promise.then(v => {
            value = v
        })
        await promise

        expect(value).toBe("promise")
    })

    it("reject() correctly rejects with a value in .then block", async () => {
        const promise = new SimplePromise((_, reject) => {
            setTimeout(() => {
                reject("error")
            }, 0)
        })

        let error: unknown

        promise.then(
            () => {
                return
            },
            err => {
                error = err
                return
            }
        )

        await waitFor(
            () => {
                expect(error).toBe("error")
            },
            {
                timeout: 1000,
            }
        )
    })

    it("resolves promise in .then block", async () => {
        const promise = new SimplePromise(resolve => {
            setTimeout(() => {
                resolve("promise")
            }, 0)
        })

        let value
        promise
            .then(() => {
                return new SimplePromise(resolve => {
                    resolve("promise2")
                })
            })
            .then(v => {
                value = v
            })

        await promise
        expect(value).toBe("promise2")
    })
})
