type Callback<T> = () => PromiseLike<T>

interface Event<T> {
  getPromise?: Callback<T>
  resolve: (result: T | PromiseLike<T>) => void
  reject: (...args: unknown[]) => void
  number: number
}

export class LimiterError extends Error {}

export function createLimiter<T = void>(
  interval: number,
  noLimitCount: number
) {
  let currentNumber = 0
  let lastCompletedNumber = 0
  let events: number[] = []
  let timeout: number | undefined
  let lastEvent: Event<T> | undefined

  function limited(getPromise?: Callback<T>): PromiseLike<T> {
    return new Promise<T>((resolve, reject) => {
      currentNumber += 1
      const event: Event<T> = {
        getPromise,
        resolve,
        reject,
        number: currentNumber,
      }
      removeOldEvents()
      if (events.length < noLimitCount) {
        execute(event)
      } else {
        if (lastEvent !== undefined) {
          lastEvent.reject(new LimiterError("rate limit exceeded"))
        }
        lastEvent = event
        if (timeout === undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          timeout = setTimeout(() => {
            timeoutAction()
          }, interval)
        }
      }
    })
  }

  function stop() {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    timeout = undefined
  }

  function removeOldEvents() {
    const t = new Date().getTime() - interval * noLimitCount
    events = events.filter(v => v >= t)
  }

  function timeoutAction() {
    if (lastEvent !== undefined) {
      execute(lastEvent)
      lastEvent = undefined
      stop()
    }
  }

  async function execute(event: Event<T>) {
    events.push(new Date().getTime())
    if (event.getPromise !== undefined) {
      try {
        const result = await event.getPromise()
        if (event.number > lastCompletedNumber) {
          lastCompletedNumber = event.number
          event.resolve(result)
        } else {
          event.reject(new LimiterError("Got newer event"))
        }
      } catch (e) {
        event.reject(e)
      }
    } else {
      // @ts-expect-error no result given
      event.resolve()
    }
  }

  return {
    limited,
  }
}
