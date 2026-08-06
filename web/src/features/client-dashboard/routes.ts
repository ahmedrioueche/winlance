import type { RouteRecordRaw } from 'vue-router'

export const clientDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/clients/:id',
    name: 'client-detail',
    component: () => import('./components/ClientDetailPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.clientDetail' },
  },
]
