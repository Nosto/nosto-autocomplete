import { nostojs } from "@nosto/nosto-js"
import { SearchHit } from "@nosto/nosto-js/client"

export function recordSearchClick(hit: SearchHit) {
  nostojs(api => api.recordSearchClick("autocomplete", hit))
}

export function recordSearchSubmit(query: string) {
  nostojs(api => api.recordSearchSubmit(query))
}
