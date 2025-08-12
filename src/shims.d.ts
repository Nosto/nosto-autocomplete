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

declare module "*.liquid" {
  const content: string
  export default content
}

declare module "*.mustache" {
  const content: string
  export default content
}

declare module "*.handlebars" {
  const content: string
  export default content
}
