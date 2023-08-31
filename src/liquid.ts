import { Liquid } from 'liquidjs'
import { State } from './state'

const engine = new Liquid()

export function fromLiquidTemplate(
    template: string,
): (state: State) => string {
    return (state) => {
        return engine.parseAndRenderSync(template, state)
    }
}

export function fromRemoteLiquidTemplate(
    url: string,
): (container: HTMLElement, state: State) => PromiseLike<void> {
    return (container, state) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url)
            xhr.onload = () => {
                if (xhr.status === 200) {
                    try {
                        container.innerHTML = engine.parseAndRenderSync(xhr.responseText, state)
                        resolve(undefined)
                    } catch (err) {
                        reject(err)
                    }
                } else {
                    reject(new Error(xhr.statusText))
                }
            }
            xhr.onerror = () => {
                reject(new Error(xhr.statusText))
            }
            xhr.send()
        })
    }
}
