import { describe, expect, it, beforeEach, vi } from "vitest"
import { getStateActions } from "../../src/utils/state"
import type { AutocompleteConfig } from "../../src/lib/config"
import type { DefaultState } from "../../src/index"
import { createHistory } from "../../src/utils/history"

describe("state utilities", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("getStateActions", () => {
    it("should update state with search results when input meets minQueryLength", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn().mockResolvedValue({ query: { query: "test" }, response: { products: [] } })
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      const actions = getStateActions({ config, input })

      const state = await actions.updateState("test")

      expect(config.fetch).toHaveBeenCalledWith("test")
      expect(state).toEqual({ query: { query: "test" }, response: { products: [] } })
    })

    it("should return history state when input is below minQueryLength and history exists", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const history = createHistory(5)
      history.add("item1")
      history.add("item2")

      const input = document.createElement("input")
      input.value = "te"

      const actions = getStateActions({ config, history, input })
      const state = await actions.updateState("te")

      expect(state).toHaveProperty("history")
      expect(state.history).toHaveLength(2)
      expect(config.fetch).not.toHaveBeenCalled()
    })

    it("should return empty state when input is below minQueryLength and no history", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      const actions = getStateActions({ config, input })

      const state = await actions.updateState("te")

      expect(state).toEqual({})
      expect(config.fetch).not.toHaveBeenCalled()
    })

    it("should return history state when inputValue is undefined and history exists", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const history = createHistory(5)
      history.add("item1")

      const input = document.createElement("input")
      const actions = getStateActions({ config, history, input })

      const state = await actions.updateState()

      expect(state).toHaveProperty("history")
      expect(state.history).toHaveLength(1)
    })

    it("should cancel previous request when updateState is called again", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi
          .fn()
          .mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({ query: { query: "test" } }), 100))
          )
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      const actions = getStateActions({ config, input })

      const firstPromise = actions.updateState("test")
      const secondPromise = actions.updateState("test2")

      // First promise should be cancelled and throw CancellableError
      await expect(firstPromise).rejects.toThrow("cancelled promise")
      // Second promise should resolve normally
      const secondResult = await secondPromise
      expect(secondResult).toBeDefined()
    })

    it("should add history item when addHistoryItem is called", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const history = createHistory(5)
      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, history, input })

      const state = await actions.addHistoryItem("new item")

      expect(state).toHaveProperty("history")
      expect(state.history).toHaveLength(1)
      expect(state.history?.[0]?.item).toBe("new item")
    })

    it("should handle addHistoryItem when no history exists", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, input })

      const state = await actions.addHistoryItem("new item")

      expect(state).toHaveProperty("history")
      expect(state.history).toBeUndefined()
    })

    it("should remove history item when removeHistoryItem is called", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const history = createHistory(5)
      history.add("item1")
      history.add("item2")

      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, history, input })

      const state = await actions.removeHistoryItem("item1")

      expect(state).toHaveProperty("history")
      expect(state.history).toHaveLength(1)
      expect(state.history?.[0]?.item).toBe("item2")
    })

    it("should handle removeHistoryItem when no history exists", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, input })

      const state = await actions.removeHistoryItem("item1")

      expect(state).toHaveProperty("history")
      expect(state.history).toBeUndefined()
    })

    it("should clear history when clearHistory is called", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const history = createHistory(5)
      history.add("item1")
      history.add("item2")

      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, history, input })

      const state = await actions.clearHistory()

      expect(state).toHaveProperty("history")
      expect(state.history).toHaveLength(0)
    })

    it("should handle clearHistory when no history exists", async () => {
      const config = {
        minQueryLength: 3,
        fetch: vi.fn()
      } as unknown as Required<AutocompleteConfig<DefaultState>>

      const input = document.createElement("input")
      input.value = "test"

      const actions = getStateActions({ config, input })

      const state = await actions.clearHistory()

      expect(state).toHaveProperty("history")
      expect(state.history).toBeUndefined()
    })
  })
})
