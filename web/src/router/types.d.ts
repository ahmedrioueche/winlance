import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'app' | 'auth' | 'blank'
    shellVariant?: 'workspace' | 'project'
    titleKey?: string
    requiresAuth?: boolean
    permissions?: string[]
  }
}
