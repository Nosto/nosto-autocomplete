import { logger } from "@nosto/search-js/utils"
import { SearchAutocompleteOptions } from "./autocomplete"

type OnClickBindings<State> = {
  [key: string]: (obj: {
    data: string | undefined
    el: HTMLElement
    update: (state: State) => void
  }) => unknown
}

export function createDropdown<State>(
  container: HTMLElement,
  initialState: PromiseLike<State>,
  render: (container: HTMLElement, state: State) => void | PromiseLike<void>,
  submit: (inputValue: string, options?: SearchAutocompleteOptions) => unknown,
  updateInput: (inputValue: string) => void,
  onClickBindings?: OnClickBindings<State>
) {
  let elements: HTMLElement[] = []
  let unbindCallbacks: Array<() => void> = []

  let isEmpty: boolean = true
  let selectedIndex: number = -1

  function handleElementSubmit(el: HTMLElement): void {
    const hit = el?.dataset?.nsHit

    if (hit) {
      const parsedHit = parseHit(hit)
      hide()

      if (parsedHit?.item) {
        submit(parsedHit.item)
        return
      }

      if (parsedHit?.keyword) {
        submit(parsedHit.keyword, {
          redirect: !!parsedHit?._redirect,
          isKeyword: true,
        })

        if (parsedHit?._redirect) {
          location.href = parsedHit._redirect
        }
        return
      }

      if (parsedHit?.url) {
        location.href = parsedHit.url
      }
    }
  }

  function loadElements() {
    isEmpty = !container.innerHTML.trim()

    if (!isEmpty) {
      elements = Array.from<HTMLElement>(
        container.querySelectorAll("[data-ns-hit]")
      ).map(el => {
        bindElementSubmit(el)
        return el
      })
    }
  }

  function bindDataCallbacks() {
    Object.entries(onClickBindings ?? {}).map(([key, callback]) => {
      // Convert camelCase to kebab-case
      const dataKey = `[data-ns-${key
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()}]`

      Array.from<HTMLElement>(container.querySelectorAll(dataKey)).map(el => {
        const data =
          el?.dataset?.[`ns${key.charAt(0).toUpperCase() + key.slice(1)}`]
        const onClick = () => {
          callback({
            data,
            el,
            update,
          })
        }

        el.addEventListener("click", onClick)
        unbindCallbacks.push(() => {
          el.removeEventListener("click", onClick)
        })
      })
    })
  }

  function bindElementSubmit(el: HTMLElement) {
    const onSubmit = () => {
      handleElementSubmit(el)
    }

    el.addEventListener("click", onSubmit)
    unbindCallbacks.push(() => {
      el.removeEventListener("click", onSubmit)
    })
  }

  function highlight(index: number, prevIndex?: number) {
    if (typeof prevIndex === "number" && elements[prevIndex]) {
      elements[prevIndex].classList.remove("selected")
    }

    if (typeof index === "number" && elements[index]) {
      elements[index]?.classList.add("selected")

      const hit = elements[index]?.dataset?.nsHit

      if (hit) {
        const parsedHit = parseHit(hit)

        if (parsedHit.item) {
          updateInput(parsedHit.item)
          return
        }

        if (parsedHit.keyword) {
          updateInput(parsedHit.keyword)
          return
        }
      }
    }
  }

  function dispose() {
    resetHighlight()
    elements = []
    unbindCallbacks.forEach(v => v())
    unbindCallbacks = []
  }

  async function update(state: State) {
    dispose()
    await render(container, state)

    // Without setTimeout React does not have committed DOM changes yet, so we don't have the correct elements.
    setTimeout(() => {
      loadElements()
      bindDataCallbacks()
      show()
    }, 0)
  }

  function hide() {
    resetHighlight()
    container.style.display = "none"
  }

  function show() {
    if (!isEmpty) {
      container.style.display = ""
    } else {
      hide()
    }
  }

  function clear() {
    dispose()
    isEmpty = true
    hide()
  }

  function isOpen() {
    return container.style.display !== "none"
  }

  function goDown() {
    let prevIndex = selectedIndex

    if (selectedIndex === elements.length - 1) {
      selectedIndex = 0
    } else {
      prevIndex = selectedIndex++
    }

    highlight(selectedIndex, prevIndex)
  }

  function goUp() {
    if (hasHighlight()) {
      let prevIndex = selectedIndex

      if (selectedIndex === 0) {
        selectedIndex = elements.length - 1
      } else {
        prevIndex = selectedIndex--
      }

      highlight(selectedIndex, prevIndex)
    } else {
      selectedIndex = elements.length - 1
      highlight(selectedIndex)
    }
  }

  function handleSubmit() {
    if (isOpen() && hasHighlight() && elements[selectedIndex]) {
      handleElementSubmit(elements[selectedIndex])
    }
  }

  function hasHighlight() {
    return selectedIndex > -1
  }

  function getHighlight() {
    return elements[selectedIndex]
  }

  function resetHighlight() {
    if (hasHighlight()) {
      elements[selectedIndex]?.classList.remove("selected")
      selectedIndex = -1
    }
  }

  function destroy() {
    dispose()
    isEmpty = true
    container.innerHTML = ""
  }

  async function init() {
    const state = await Promise.resolve(initialState)
    await Promise.resolve(render(container, state))

    // Without setTimeout React does not have committed DOM changes yet, so we don't have the correct elements.
    setTimeout(() => {
      loadElements()
      bindDataCallbacks()
      hide()
    }, 0)
  }
  init()

  return {
    update,
    clear,
    isOpen,
    goDown,
    goUp,
    handleSubmit,
    destroy,
    show,
    hide,
    resetHighlight,
    hasHighlight,
    getHighlight,
    container,
  }
}

export type Dropdown<T> = ReturnType<typeof createDropdown<T>>

interface Hit {
  item?: string
  keyword?: string
  url?: string
  _redirect?: string
}

export function parseHit(hit: string): Hit {
  try {
    const parsedHit: Hit | undefined | null = JSON.parse(hit)
    return parsedHit ?? {}
  } catch (error) {
    logger.warn("Could not parse hit", error)
    return {}
  }
}
