import { logger } from "../api/client"
import { AutocompleteConfig, defaultGaConfig } from "../config"

const localStorageKey = "nostoAutocomplete:gaEvent"

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

  if (delay) {
    saveToLocalStorage(title, location)
  } else {
    if ("gtag" in window && typeof window.gtag === "function") {
      const accounts =
        "google_tag_manager" in window &&
        typeof window.google_tag_manager === "object"
          ? Object.keys(window.google_tag_manager || []).filter(e => {
              return e.substring(0, 2) == "G-"
            })
          : []

      if (accounts.length > 1) {
        for (let i = 0; i < accounts.length; i++) {
          window.gtag("event", "page_view", {
            page_title: title,
            page_location: location,
            send_to: accounts[i],
          })
        }
      } else {
        window.gtag("event", "page_view", {
          page_title: title,
          page_location: location,
        })
      }
    }
    if (
      "ga" in window &&
      typeof window.ga === "function" &&
      "getAll" in window.ga &&
      typeof window.ga.getAll === "function"
    ) {
      try {
        const url = new URL(location)
        const trackers = window.ga!.getAll()
        if (trackers?.length > 0) {
          trackers[0]?.send("pageview", url.pathname + url.search)
        }
      } catch (error) {
        logger.warn("Could not send pageview to GA", error)
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
        `${gaConfig?.serpPath || location.pathname}?${`${encodeURIComponent(
          gaConfig.queryParamName
        )}=${encodeURIComponent(value).replace(/%20/g, "+")}`}`,
        window.location.origin
      ).toString()
    } catch (error) {
      logger.warn("Could not create track url", error)
      return undefined
    }
  }
}

function saveToLocalStorage(title: string, location: string): void {
  localStorage.setItem(localStorageKey, JSON.stringify({ title, location }))
}

interface Event {
  title: string
  location: string
}

function consumeLocalStorageEvent(): void {
  const eventString = localStorage.getItem(localStorageKey)
  if (typeof eventString === "string") {
    localStorage.removeItem(localStorageKey)
    try {
      const event: Event = JSON.parse(eventString)
      trackGaPageView(event)
    } catch (e) {
      logger.warn("Could not consume pageView", e)
    }
  }
}

setTimeout(consumeLocalStorageEvent, 1000)
