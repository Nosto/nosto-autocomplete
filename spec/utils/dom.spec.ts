import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import { findAll, DOMReady, parents, matches, bindClickOutside } from "../../src/utils/dom"

describe("dom utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container" class="parent">
        <div id="child1" class="child item">
          <span id="grandchild1" class="grandchild">Text</span>
        </div>
        <div id="child2" class="child item">
          <span id="grandchild2" class="grandchild">Text</span>
        </div>
      </div>
      <div id="other" class="other">
        <button id="outside-button">Outside</button>
      </div>
    `
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  describe("findAll", () => {
    it("should find elements by selector string", () => {
      const elements = findAll(".child")
      expect(elements).toHaveLength(2)
      expect(elements[0]?.id).toBe("child1")
      expect(elements[1]?.id).toBe("child2")
    })

    it("should return single element when Element is passed", () => {
      const element = document.getElementById("child1")!
      const elements = findAll(element)
      expect(elements).toHaveLength(1)
      expect(elements[0]).toBe(element)
    })

    it("should filter by type when filterType is provided", () => {
      const elements = findAll<HTMLDivElement>(".child", HTMLDivElement)
      expect(elements).toHaveLength(2)
      expect(elements[0]).toBeInstanceOf(HTMLDivElement)
    })

    it("should return empty array when no elements match", () => {
      const elements = findAll(".nonexistent")
      expect(elements).toHaveLength(0)
    })

    it("should filter out elements that don't match filterType", () => {
      document.body.innerHTML += '<span class="test-span"></span>'
      const elements = findAll<HTMLDivElement>(".test-span", HTMLDivElement)
      expect(elements).toHaveLength(0)
    })
  })

  describe("DOMReady", () => {
    it("should resolve immediately when document is already loaded", async () => {
      Object.defineProperty(document, "readyState", {
        value: "complete",
        writable: true,
        configurable: true
      })

      const addEventListenerSpy = vi.spyOn(window, "addEventListener")

      const startTime = Date.now()
      await DOMReady()
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(10)
      expect(addEventListenerSpy).not.toHaveBeenCalled()

      addEventListenerSpy.mockRestore()
    })

    it("should resolve immediately when document is interactive", async () => {
      Object.defineProperty(document, "readyState", {
        value: "interactive",
        writable: true,
        configurable: true
      })

      const addEventListenerSpy = vi.spyOn(window, "addEventListener")

      const startTime = Date.now()
      await DOMReady()
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(10)
      expect(addEventListenerSpy).not.toHaveBeenCalled()

      addEventListenerSpy.mockRestore()
    })
  })

  describe("parents", () => {
    it("should return all parent elements", () => {
      const element = document.getElementById("grandchild1")!
      const parentElements = parents(element)

      expect(parentElements.length).toBeGreaterThanOrEqual(3)
      expect(parentElements[0]?.id).toBe("child1")
      expect(parentElements[1]?.id).toBe("container")
    })

    it("should filter parents by selector", () => {
      const element = document.getElementById("grandchild1")!
      const parentElements = parents(element, ".parent")

      expect(parentElements).toHaveLength(1)
      expect(parentElements[0]?.id).toBe("container")
    })

    it("should return empty array when no parents match selector", () => {
      const element = document.getElementById("grandchild1")!
      const parentElements = parents(element, ".nonexistent")

      expect(parentElements).toHaveLength(0)
    })

    it("should accept selector string as target", () => {
      const parentElements = parents("#grandchild1", ".parent")

      expect(parentElements).toHaveLength(1)
      expect(parentElements[0]?.id).toBe("container")
    })

    it("should return all parents when selector is undefined", () => {
      const element = document.getElementById("grandchild1")!
      const parentElements = parents(element)

      expect(parentElements.length).toBeGreaterThan(0)
    })
  })

  describe("matches", () => {
    it("should return true when element matches selector", () => {
      const element = document.getElementById("child1")!
      expect(matches(element, ".child")).toBe(true)
    })

    it("should return false when element does not match selector", () => {
      const element = document.getElementById("child1")!
      expect(matches(element, ".other")).toBe(false)
    })

    it("should accept selector string as target", () => {
      expect(matches("#child1", ".child")).toBe(true)
    })

    it("should work with complex selectors", () => {
      expect(matches("#child1", "div.child.item")).toBe(true)
    })

    it("should return true if any element matches when multiple elements selected", () => {
      expect(matches(".child", ".item")).toBe(true)
    })
  })

  describe("bindClickOutside", () => {
    it("should call callback when clicking outside both elements", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      const outsideButton = document.getElementById("outside-button")!
      outsideButton.click()

      expect(callbackCalled).toBe(true)

      binding.destroy()
    })

    it("should not call callback when clicking the element itself", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      element.click()

      expect(callbackCalled).toBe(false)

      binding.destroy()
    })

    it("should not call callback when clicking the input element", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      input.click()

      expect(callbackCalled).toBe(false)

      binding.destroy()
    })

    it("should not call callback when clicking inside the element", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      const grandchild = document.getElementById("grandchild1")!
      grandchild.click()

      expect(callbackCalled).toBe(false)

      binding.destroy()
    })

    it("should remove event listener when destroy is called", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      binding.destroy()

      const outsideButton = document.getElementById("outside-button")!
      outsideButton.click()

      expect(callbackCalled).toBe(false)
    })

    it("should not call callback when target is not an HTMLElement", () => {
      const element = document.getElementById("container") as HTMLElement
      const input = document.getElementById("child1") as HTMLElement
      let callbackCalled = false

      const binding = bindClickOutside([element, input], () => {
        callbackCalled = true
      })

      // Create a custom event with a non-HTMLElement target
      const event = new MouseEvent("click", { bubbles: true })
      Object.defineProperty(event, "target", { value: document, writable: false })
      document.dispatchEvent(event)

      expect(callbackCalled).toBe(false)

      binding.destroy()
    })
  })
})
