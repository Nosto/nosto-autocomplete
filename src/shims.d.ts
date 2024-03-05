type GaNamespace = {
    (): void
    getAll(): {
        send(type: string, url: string): void
    }[]
}

interface Window {
    ga?: GaNamespace
    gtag?: unknown
    google_tag_manager?: unknown
}