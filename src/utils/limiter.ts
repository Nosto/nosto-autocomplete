import { AnyPromise } from "./promise"

type Callback<T> = () => PromiseLike<T>

interface Event<T> {
    getPromise?: Callback<T>
    resolve: (result?: T) => void
    reject: (...args: unknown[]) => void
    number: number
}

export class LimiterError extends Error {}

export class Limiter<T = void> {
    protected interval: number
    protected noLimitCount: number
    protected events: number[]
    protected timeout: number | undefined
    protected lastEvent: Event<T> | undefined
    protected currentNumber: number
    protected lastCompletedNumber: number

    constructor(interval: number, noLimitCount: number) {
        this.interval = interval
        this.noLimitCount = noLimitCount
        this.events = []
        this.timeout = undefined
        this.lastEvent = undefined
        this.currentNumber = 0
        this.lastCompletedNumber = 0
    }

    limited(getPromise?: Callback<T>): PromiseLike<T> {
        return new AnyPromise<T>((resolve, reject) => {
            this.currentNumber += 1
            const event = {
                getPromise,
                resolve,
                reject,
                number: this.currentNumber,
            } as Event<T>
            this.removeOldEvents()
            if (this.events.length < this.noLimitCount) {
                this.execute(event)
            } else {
                if (this.lastEvent !== undefined) {
                    this.lastEvent.reject(
                        new LimiterError("rate limit exceeded")
                    )
                }
                this.lastEvent = event
                if (this.timeout === undefined) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.timeout = setTimeout(() => {
                        this.timeoutAction()
                    }, this.interval)
                }
            }
        })
    }

    protected stop(): void {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout)
        }
        this.timeout = undefined
    }

    protected removeOldEvents(): void {
        const t = new Date().getTime() - this.interval * this.noLimitCount
        this.events = this.events.filter(v => v >= t)
    }

    protected timeoutAction(): void {
        if (this.lastEvent !== undefined) {
            this.execute(this.lastEvent)
            this.lastEvent = undefined
            this.stop()
        }
    }

    protected execute(event: Event<T>): void {
        this.events.push(new Date().getTime())
        if (event.getPromise !== undefined) {
            event.getPromise().then(
                result => {
                    if (event.number > this.lastCompletedNumber) {
                        this.lastCompletedNumber = event.number
                        event.resolve(result)
                    } else {
                        event.reject(new LimiterError("Got newer event"))
                    }
                },
                (...args: unknown[]) => {
                    event.reject(...args)
                }
            )
        } else {
            event.resolve()
        }
    }
}
