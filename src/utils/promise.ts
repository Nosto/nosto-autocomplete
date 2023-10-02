class SimplePromise<T> implements PromiseLike<T> {
    private value: T | undefined
    private error: any
    private fulfilled = false
    private doneCallback: (() => void) | undefined = undefined

    constructor(
        callback: (
            resolve: (value: T) => void,
            reject: (value: any) => void,
        ) => void,
    ) {
        callback(
            (value) => {
                if (!this.fulfilled) {
                    this.value = value
                    this.fulfilled = true

                    if (this.doneCallback) {
                        this.doneCallback()
                    }
                }
            },
            (error) => {
                if (!this.fulfilled) {
                    this.error = error
                    this.fulfilled = true

                    if (this.doneCallback) {
                        this.doneCallback()
                    }
                }
            },
        )
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined,
    ): PromiseLike<TResult1 | TResult2> {
        return new SimplePromise((resolve, reject) => {
            const doneCallback = () => {
                if (this.error) {
                    if (onrejected) {
                        SimplePromise.resolve(onrejected(this.error)).then(
                            resolve,
                            reject,
                        )
                    }
                } else {
                    if (onfulfilled) {
                        SimplePromise.resolve(
                            onfulfilled(this.value as T),
                        ).then(resolve, reject)
                    }
                }
            }
            if (this.fulfilled) {
                doneCallback()
            } else {
                this.doneCallback = doneCallback
            }
        })
    }

    static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T> {
        return new SimplePromise<T>((resolve, reject) => {
            if (value && typeof value === 'object' && 'then' in value) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }
}

export let AnyPromise = 'Promise' in window ? window.Promise : SimplePromise

export type Cancellable<T> = { promise: PromiseLike<T>; cancel: () => void }

export function makeCancellable<T>(promise: PromiseLike<T>): Cancellable<T> {
    let hasCanceled_ = false

    const wrappedPromise = new AnyPromise<T>((resolve, reject) => {
        promise.then(
            (val) => {
                hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)
            },
            (error) => {
                hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
            },
        )
    })

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true
        },
    }
}
