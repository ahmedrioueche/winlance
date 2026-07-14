import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./components/LoginPage.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./components/RegisterPage.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('./components/VerifyEmailPage.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    component: () => import('./components/PasswordResetPage.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/password-reset/confirm',
    name: 'password-reset-confirm',
    component: () => import('./components/PasswordResetConfirmPage.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/app/profile',
    name: 'profile',
    component: () => import('./components/ProfilePage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
]
