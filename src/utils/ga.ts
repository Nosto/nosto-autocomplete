import { logAndCaptureError } from "../api/client"
import { AutocompleteConfig, defaultGaConfig } from "../config"

const localStorageKey = "nostoAutocomplete:gaEvent"

type GaNamespace = {
    (): void
    getAll(): {
        send(type: string, url: string): void
    }[]
}

export function trackGaPageView(options?: {
    delay?: boolean
    title?: string
    location?: string
}) {
    const {
        delay = false,
        title = document.title,
        location = window.location.href,
    } = options || {}

    const windowObj = window as {
        ga?: GaNamespace
        gtag?: unknown
        google_tag_manager?: unknown
    }

    if (delay) {
        saveToLocalStorage(title, location)
    } else {
        if ("gtag" in windowObj && typeof windowObj.gtag === "function") {
            const accounts =
                "google_tag_manager" in windowObj &&
                typeof windowObj.google_tag_manager === "object"
                    ? Object.keys(windowObj.google_tag_manager || []).filter(
                          e => {
                              return e.substring(0, 2) == "G-"
                          }
                      )
                    : []

            if (accounts.length > 1) {
                for (let i = 0; i < accounts.length; i++) {
                    windowObj.gtag("event", "page_view", {
                        page_title: title,
                        page_location: location,
                        send_to: accounts[i],
                    })
                }
            } else {
                windowObj.gtag("event", "page_view", {
                    page_title: title,
                    page_location: location,
                })
            }
        }
        if (
            "ga" in windowObj &&
            typeof windowObj.ga === "function" &&
            "getAll" in windowObj.ga &&
            typeof windowObj.ga.getAll === "function"
        ) {
            try {
                const url = new URL(location)
                const trackers = windowObj.ga!.getAll()
                if (trackers?.length > 0) {
                    trackers[0]?.send("pageview", url.pathname + url.search)
                }
            } catch (error) {
                logAndCaptureError("Could not send pageview to GA", error, "warn")
            }
        }
    }
}

export const isGaEnabled = <State>(config: AutocompleteConfig<State>) =>
    typeof config.googleAnalytics === "boolean"
        ? config.googleAnalytics
        : typeof config.googleAnalytics === "object" &&
          config.googleAnalytics.enabled

export const getGaTrackUrl = <State>(
    value: string | undefined,
    config: AutocompleteConfig<State>
) => {
    const gaConfig = isGaEnabled(config)
        ? typeof config.googleAnalytics === "boolean"
            ? defaultGaConfig
            : {
                  ...defaultGaConfig,
                  ...config.googleAnalytics,
              }
        : undefined

    if (value && gaConfig) {
        try {
            return new URL(
                `${
                    gaConfig?.serpPath || location.pathname
                }?${`${encodeURIComponent(
                    gaConfig.queryParamName
                )}=${encodeURIComponent(value).replace(/%20/g, "+")}`}`,
                window.location.origin
            ).toString()
        } catch (error) {
            logAndCaptureError("Could not create track url", error, "warn")
            return undefined
        }
    }
}

function saveToLocalStorage(title: string, location: string): void {
    localStorage.setItem(localStorageKey, JSON.stringify({ title, location }))
}

function consumeLocalStorageEvent(): void {
    const eventString = localStorage.getItem(localStorageKey)
    if (typeof eventString === "string") {
        localStorage.removeItem(localStorageKey)
        try {
            const event = JSON.parse(eventString) as {
                title: string
                location: string
            }
            trackGaPageView(event)
        } catch (e) {
            logAndCaptureError("Could not consume pageView", e, "warn")
        }
    }
}

setTimeout(consumeLocalStorageEvent, 1000)
