/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_NEXUS_DEFAULT_LOCALE?: string
    readonly VITE_API_URL?: string
    readonly VITE_WS_URL?: string
    // Додайте інші змінні середовища за потребою
  }
}