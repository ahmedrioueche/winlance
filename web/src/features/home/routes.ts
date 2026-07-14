import type { RouteRecordRaw } from 'vue-router'

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/HomePage.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  },
  {
    path: '/app',
    name: 'dashboard',
    component: () => import('./components/DashboardPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
]
