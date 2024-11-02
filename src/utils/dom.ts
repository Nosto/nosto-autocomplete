type Selector = string | Element

export function findAll<T extends Element>(
  selector: Selector,
  filterType?: { new (): T }
): T[] {
  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : [selector]
  return elements.filter((v): v is T =>
    filterType ? v instanceof filterType : true
  )
}

export async function DOMReady(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState !== "loading") {
      resolve()
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        resolve()
      })
    }
  })
}

export function parents(target: Selector, selector?: string): Element[] {
  let parentList: Element[] = []
  findAll(target).forEach(element => {
    const parent = element.parentNode
    if (parent !== document && parent instanceof Element) {
      parentList.push(parent)
      parentList = parentList.concat(parents(parent))
    }
  })
  return parentList.filter(
    element => selector === undefined || matches(element, selector)
  )
}

export function matches(target: Selector, selector: string): boolean {
  const matchesFunc =
    Element.prototype.matches ||
    // @ts-expect-error proprietary method
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector
  return findAll(target).some(element => matchesFunc.call(element, selector))
}

export function bindClickOutside(
  [element, input]: Array<HTMLElement>,
  callback: () => void
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

  document.addEventListener("click", onClick)

  return {
    destroy: () => {
      document.removeEventListener("click", onClick)
    },
  }
}
