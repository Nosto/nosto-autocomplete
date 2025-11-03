import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import { createHistory } from "../../src/utils/history"

const HISTORY_KEY = "nosto:autocomplete:history"

describe("history utilities", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("createHistory", () => {
    it("should add items to history", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")

      const items = history.getItems()
      expect(items).toHaveLength(2)
      expect(items).toEqual([{ item: "item2" }, { item: "item1" }])
    })

    it("should limit history size", () => {
      const history = createHistory(3)

      history.add("item1")
      history.add("item2")
      history.add("item3")
      history.add("item4")

      const items = history.getItems()
      expect(items).toHaveLength(3)
      expect(items).toEqual([{ item: "item4" }, { item: "item3" }, { item: "item2" }])
    })

    it("should not add duplicate items", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")
      history.add("item1")

      const items = history.getItems()
      expect(items).toHaveLength(2)
      expect(items).toEqual([{ item: "item1" }, { item: "item2" }])
    })

    it("should clear all items", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")
      history.clear()

      const items = history.getItems()
      expect(items).toHaveLength(0)
    })

    it("should remove specific item", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")
      history.add("item3")
      history.remove("item2")

      const items = history.getItems()
      expect(items).toHaveLength(2)
      expect(items).toEqual([{ item: "item3" }, { item: "item1" }])
    })

    it("should persist items to localStorage", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")

      const stored = localStorage.getItem(HISTORY_KEY)
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(2)
      expect(parsed).toEqual([{ item: "item2" }, { item: "item1" }])
    })

    it("should load items from localStorage on creation", () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([{ item: "existing" }]))

      const history = createHistory(5)
      const items = history.getItems()

      expect(items).toHaveLength(1)
      expect(items).toEqual([{ item: "existing" }])
    })

    it("should handle empty localStorage", () => {
      const history = createHistory(5)
      const items = history.getItems()

      expect(items).toHaveLength(0)
    })

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem(HISTORY_KEY, "invalid json")

      const history = createHistory(5)
      const items = history.getItems()

      expect(items).toHaveLength(0)
    })

    it("should handle null JSON parse result", () => {
      localStorage.setItem(HISTORY_KEY, "null")

      const history = createHistory(5)
      const items = history.getItems()

      expect(items).toHaveLength(0)
    })

    it("should handle localStorage.getItem returning null", () => {
      const history = createHistory(5)
      const items = history.getItems()

      expect(items).toHaveLength(0)
    })

    it("should handle localStorage.setItem errors gracefully", () => {
      const history = createHistory(5)

      // Mock localStorage.setItem to throw an error
      vi.stubGlobal("localStorage", {
        ...localStorage,
        setItem: vi.fn(() => {
          throw new Error("Storage quota exceeded")
        })
      })

      // Should not throw
      expect(() => history.add("item1")).not.toThrow()

      // Restore
      vi.unstubAllGlobals()
    })

    it("should handle localStorage.getItem errors gracefully", () => {
      // Mock localStorage.getItem to throw an error
      vi.stubGlobal("localStorage", {
        ...localStorage,
        getItem: vi.fn(() => {
          throw new Error("Storage access denied")
        })
      })

      // Should not throw
      expect(() => createHistory(5)).not.toThrow()

      // Restore
      vi.unstubAllGlobals()
    })

    it("should update localStorage when clearing items", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")
      history.clear()

      const stored = localStorage.getItem(HISTORY_KEY)
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })

    it("should update localStorage when removing items", () => {
      const history = createHistory(5)

      history.add("item1")
      history.add("item2")
      history.remove("item1")

      const stored = localStorage.getItem(HISTORY_KEY)
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed).toEqual([{ item: "item2" }])
    })
  })
})
