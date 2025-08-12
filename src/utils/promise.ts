export type Cancellable<T> = { promise: PromiseLike<T>; cancel: () => void }

export class CancellableError extends Error {}

export function makeCancellable<T>(promise: PromiseLike<T>): Cancellable<T> {
    let hasCanceled_ = false

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        // eslint-disable-next-line promise/prefer-await-to-then
        return promise.then(
            val => (hasCanceled_ ? reject(new CancellableError("cancelled promise")) : resolve(val)),
            error => (hasCanceled_ ? reject(new CancellableError("cancelled promise")) : reject(error))
        )
    })

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true
        }
    }
}
