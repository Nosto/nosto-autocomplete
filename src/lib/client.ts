import { nostojs } from "@nosto/nosto-js"
import { SearchHit } from "@nosto/nosto-js/client"

function log(level: keyof typeof logger, ...args: unknown[]) {
  nostojs(api => api.internal.logger[level](...args))
}

export const logger = {
  error: (...args: unknown[]) => log("error", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
}

export function recordSearchClick(hit: SearchHit) {
  nostojs(api => api.recordSearchClick("autocomplete", hit))
}

export function recordSearchSubmit(query: string) {
  nostojs(api => api.recordSearchSubmit(query))
}
