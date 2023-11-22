export class SimplePromise<T> implements PromiseLike<T> {
    private status: string
    private value: T
    private onFulfilledCallbacks: Array<(value: T) => void>
    private onRejectedCallbacks: Array<(value: unknown) => void>

    constructor(
        handler: (
            resolve: (value: T) => void,
            reject: (reason?: unknown) => void
        ) => void
    ) {
        this.value = null as T
        this.status = "pending"
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = (value: T) => {
            if (this.status === "pending") {
                this.status = "fulfilled"
                this.value = value
                this.onFulfilledCallbacks.forEach(fn => fn(value))
            }
        }

        const reject = (value: unknown) => {
            if (this.status === "pending") {
                this.status = "rejected"
                this.value = value as T
                this.onRejectedCallbacks.forEach(fn => fn(value))
            }
        }

        try {
            handler(resolve, reject)
        } catch (err: unknown) {
            reject(err)
        }
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
            | undefined
            | null
    ): PromiseLike<TResult1 | TResult2> {
        return new SimplePromise((resolve, reject) => {
            if (this.status === "pending") {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        const fulfilledFromLastPromise = onfulfilled?.(
                            this.value
                        )
                        if (
                            fulfilledFromLastPromise &&
                            typeof fulfilledFromLastPromise === "object" &&
                            "then" in fulfilledFromLastPromise
                        ) {
                            fulfilledFromLastPromise.then(resolve, reject)
                        } else {
                            resolve(fulfilledFromLastPromise as TResult1)
                        }
                    } catch (err) {
                        reject(err)
                    }
                })
                this.onRejectedCallbacks.push(() => {
                    try {
                        const rejectedFromLastPromise = onrejected?.(this.value)
                        if (
                            rejectedFromLastPromise &&
                            typeof rejectedFromLastPromise === "object" &&
                            "then" in rejectedFromLastPromise
                        ) {
                            rejectedFromLastPromise.then(resolve, reject)
                        } else {
                            reject(rejectedFromLastPromise)
                        }
                    } catch (err) {
                        reject(err)
                    }
                })
            }

            if (this.status === "fulfilled") {
                try {
                    const fulfilledFromLastPromise = onfulfilled?.(this.value)
                    if (
                        fulfilledFromLastPromise &&
                        typeof fulfilledFromLastPromise === "object" &&
                        "then" in fulfilledFromLastPromise
                    ) {
                        fulfilledFromLastPromise.then(resolve, reject)
                    } else {
                        resolve(fulfilledFromLastPromise as TResult1)
                    }
                } catch (err) {
                    reject(err)
                }
            }

            if (this.status === "rejected") {
                try {
                    const rejectedFromLastPromise = onrejected?.(this.value)
                    if (
                        rejectedFromLastPromise &&
                        typeof rejectedFromLastPromise === "object" &&
                        "then" in rejectedFromLastPromise
                    ) {
                        rejectedFromLastPromise.then(resolve, reject)
                    } else {
                        reject(rejectedFromLastPromise)
                    }
                } catch (err) {
                    reject(err)
                }
            }
        })
    }

    static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T> {
        return new SimplePromise<T>((resolve, reject) => {
            if (value && typeof value === "object" && "then" in value) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }
}

export const AnyPromise = "Promise" in window ? window.Promise : SimplePromise

export type Cancellable<T> = { promise: PromiseLike<T>; cancel: () => void }

export class CancellableError extends Error {}

export function makeCancellable<T>(promise: PromiseLike<T>): Cancellable<T> {
    let hasCanceled_ = false

    const wrappedPromise = new AnyPromise<T>((resolve, reject) => {
        promise.then(
            val => {
                hasCanceled_
                    ? reject(new CancellableError("cancelled promise"))
                    : resolve(val)
            },
            error => {
                hasCanceled_
                    ? reject(new CancellableError("cancelled promise"))
                    : reject(error)
            }
        )
    })

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true
        },
    }
}
