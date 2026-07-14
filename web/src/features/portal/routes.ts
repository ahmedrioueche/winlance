import type { RouteRecordRaw } from 'vue-router'
export const portalRoutes: RouteRecordRaw[] = [{ path: '/portal/:token', name: 'portal', component: () => import('./components/PortalDashboardPage.vue'), meta: { layout: 'blank', requiresAuth: false } }]
