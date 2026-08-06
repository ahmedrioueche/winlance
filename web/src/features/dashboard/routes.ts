import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/projects',
    name: 'projects',
    component: () => import('./components/ProjectsPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.projects' },
  },
  {
    path: '/app/clients',
    name: 'clients',
    component: () => import('./components/ClientsPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.clients' },
  },
  {
    path: '/app/analytics',
    name: 'analytics',
    component: () => import('./components/AnalyticsPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.analytics' },
  },
  {
    path: '/app/settings',
    name: 'settings',
    component: () => import('./components/SettingsPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.settings' },
  },
]
