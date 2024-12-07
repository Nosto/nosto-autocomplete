import { nostojs } from "@nosto/nosto-js"
import { API } from "@nosto/nosto-js/client"

/**
 * @group Nosto Client
 * @category Core
 */
type LogLevel = "error" | "warn" | "info" | "debug"

/**
 * @group Nosto Client
 * @category Core
 */
export function getNostoClient(): Promise<API> {
    return new Promise(nostojs)
}

export function log(level: LogLevel, ...args: unknown[]) {
    nostojs(api => api.internal.logger[level](...args))
}