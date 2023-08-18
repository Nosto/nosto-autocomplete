type Selector = string | Element | Element[] | NodeListOf<Element>

export function findAll<T extends Element>(
    selector: Selector,
    filterType?: { new (): T },
): T[] {
    const elements = (() => {
        if (!selector) {
            return []
        } else if (selector instanceof Element) {
            return [selector]
        } else if (selector instanceof Array) {
            return selector
        } else if (selector instanceof NodeList) {
            return Array.prototype.slice.call(selector) as Element[]
        }
        return Array.prototype.slice.call(document.querySelectorAll(selector))
    })()

    return elements.filter((v): v is T =>
        filterType ? v instanceof filterType : true,
    )
}

export async function DOMReady(): Promise<void> {
    return new Promise((resolve) => {
        if (document.readyState !== 'loading') {
            resolve()
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                resolve()
            })
        }
    })
}

export function parents(target: Selector, selector?: string): Element[] {
    let parentList: Element[] = []
    findAll(target).forEach((element) => {
        const parent = element.parentNode
        if (parent !== document && parent instanceof Element) {
            parentList.push(parent)
            parentList = parentList.concat(parents(parent))
        }
    })
    return parentList.filter(
        (element) => selector === undefined || matches(element, selector),
    )
}

export function matches(target: Selector, selector: string): boolean {
    const matchesFunc =
        Element.prototype.matches ||
        (Element.prototype as any).msMatchesSelector ||
        Element.prototype.webkitMatchesSelector
    return findAll(target).some((element) =>
        matchesFunc.call(element, selector),
    )
}

export function bindClickOutside(
    [element, input]: Array<HTMLElement>,
    callback: () => void,
) {
    const onClick = (event: MouseEvent) => {
        const target = event.target

        if (target instanceof HTMLElement && element) {
            if (
                target !== element &&
                target !== input &&
                !parents(target).includes(element)
            ) {
                callback()
            }
        }
    }

    document.addEventListener('click', onClick)

    return {
        destroy: () => {
            document.removeEventListener('click', onClick)
        },
    }
}
