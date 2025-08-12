import { describe, expect, it, vi, beforeEach, Mock } from "vitest"
import debounce from "../src/utils/debounce"

vi.useFakeTimers()

describe("debounce", () => {
  let callback: Mock

  beforeEach(() => {
    callback = vi.fn()
  })

  it("should execute the callback immediately on the first call", () => {
    const debouncedFunction = debounce(1000)
    debouncedFunction(callback)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should not execute the callback immediately on subsequent calls within the delay period", () => {
    const debouncedFunction = debounce(1000)
    debouncedFunction(callback)
    debouncedFunction(callback)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should execute the callback after the delay period on subsequent calls", () => {
    const debouncedFunction = debounce(1000)
    debouncedFunction(callback)
    debouncedFunction(callback)
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("should reset the delay if called again within the delay period", () => {
    const debouncedFunction = debounce(1000)
    debouncedFunction(callback)
    debouncedFunction(callback)
    vi.advanceTimersByTime(500)
    debouncedFunction(callback)
    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
