import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'app' | 'auth' | 'blank'
    requiresAuth?: boolean
    permissions?: string[]
  }
}
