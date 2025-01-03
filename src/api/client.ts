import { nostojs } from "@nosto/nosto-js"
import { API } from "@nosto/nosto-js/client"

/**
 * @group Nosto Client
 * @category Core
 */
export function getNostoClient(): Promise<API> {
  return new Promise(nostojs)
}

export const logger = {
  error: (...args: unknown[]) => log("error", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
}

function log(level: keyof typeof logger, ...args: unknown[]) {
  nostojs(api => api.internal.logger[level](...args))
}
