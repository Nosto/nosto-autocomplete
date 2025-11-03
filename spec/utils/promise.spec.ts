import { describe, expect, it } from "vitest"
import { makeCancellable, CancellableError } from "../../src/utils/promise"

describe("promise utilities", () => {
  describe("makeCancellable", () => {
    it("should resolve when promise resolves and not cancelled", async () => {
      const promise = Promise.resolve("success")
      const cancellable = makeCancellable(promise)

      await expect(cancellable.promise).resolves.toBe("success")
    })

    it("should reject when promise rejects and not cancelled", async () => {
      const error = new Error("test error")
      const promise = Promise.reject(error)
      const cancellable = makeCancellable(promise)

      await expect(cancellable.promise).rejects.toThrow("test error")
    })

    it("should reject with CancellableError when cancelled before resolve", async () => {
      const promise = new Promise<string>(resolve => {
        setTimeout(() => resolve("success"), 100)
      })
      const cancellable = makeCancellable(promise)

      cancellable.cancel()

      try {
        await cancellable.promise
        expect.fail("Should have thrown CancellableError")
      } catch (error) {
        expect(error).toBeInstanceOf(CancellableError)
        expect((error as Error).message).toBe("cancelled promise")
      }

      // Ensure original promise completes to avoid unhandled rejection
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    it("should reject with CancellableError when cancelled before reject", async () => {
      const promise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("test error")), 100)
      })
      const cancellable = makeCancellable(promise)

      cancellable.cancel()

      try {
        await cancellable.promise
        expect.fail("Should have thrown CancellableError")
      } catch (error) {
        expect(error).toBeInstanceOf(CancellableError)
        expect((error as Error).message).toBe("cancelled promise")
      }

      // Ensure original promise completes to avoid unhandled rejection
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    it("should allow cancelling after creation", async () => {
      const promise = Promise.resolve("success")
      const cancellable = makeCancellable(promise)

      expect(() => cancellable.cancel()).not.toThrow()

      // Catch the rejection to avoid unhandled rejection warning
      // @ts-expect-error -- testing cancellation behavior
      await cancellable.promise.catch(() => {
        // Expected rejection after cancellation
      })
    })

    it("should handle immediate resolution", async () => {
      const promise = Promise.resolve("immediate")
      const cancellable = makeCancellable(promise)

      await expect(cancellable.promise).resolves.toBe("immediate")
    })

    it("should handle immediate rejection", async () => {
      const error = new Error("immediate error")
      const promise = Promise.reject(error)
      const cancellable = makeCancellable(promise)

      await expect(cancellable.promise).rejects.toThrow("immediate error")
    })
  })

  describe("CancellableError", () => {
    it("should be an instance of Error", () => {
      const error = new CancellableError("test message")
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CancellableError)
      expect(error.message).toBe("test message")
    })
  })
})
