import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./components/LoginPage.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false,
    },
  },
]
