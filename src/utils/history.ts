import { logger } from "@nosto/search-js/utils"
import { DefaultState } from "./state"

type Items = NonNullable<DefaultState["history"]>

export function createHistory(size: number) {
  const localStorageKey = "nosto:autocomplete:history"
  let items = get()

  function get(): Items {
    try {
      return JSON.parse(localStorage.getItem(localStorageKey) ?? "[]") ?? []
    } catch (err) {
      logger.error("Could not get history items.", err)
      return []
    }
  }

  function set(data: Items) {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(data))
    } catch (err) {
      logger.error("Could not set history items.", err)
    }
  }

  function add(item: string) {
    set((items = [{ item }, ...(items?.filter(v => v.item !== item) || [])].slice(0, size)))
  }

  function clear() {
    set((items = []))
  }

  function remove(item: string) {
    set((items = items.filter(v => v.item !== item)))
  }

  function getItems() {
    return items
  }

  return {
    add,
    clear,
    remove,
    getItems
  }
}

export type History = ReturnType<typeof createHistory>
