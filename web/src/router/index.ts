import { createRouter, createWebHistory } from 'vue-router'

import { authRoutes } from '@/features/auth'
import { dashboardRoutes } from '@/features/dashboard'
import { clientDashboardRoutes } from '@/features/client-dashboard'
import { projectDashboardRoutes } from '@/features/project-dashboard'
import { homeRoutes } from '@/features/home'
import { analyticsRoutes } from '@/features/analytics'
import { logger } from '@/shared/utils/logger'

import { registerAuthGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...homeRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    ...clientDashboardRoutes,
    ...projectDashboardRoutes,
    ...analyticsRoutes,
    {
      path: '/error',
      name: 'app-error',
      component: () => import('@/app/pages/ErrorPage.vue'),
      meta: { layout: 'blank', requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/app/pages/NotFoundPage.vue'),
      meta: { layout: 'blank', requiresAuth: false },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    const scroller = document.getElementById('app-scroll')
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0 })
    }

    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, top: 0 }
    }
    return { top: 0, left: 0 }
  },
})

registerAuthGuard(router)

router.afterEach((to) => {
  if (to.hash) return
  requestAnimationFrame(() => {
    document.getElementById('app-scroll')?.scrollTo({ top: 0, left: 0 })
    window.scrollTo({ top: 0, left: 0 })
  })
})

router.onError((error) => {
  logger.error('Router error', error)
  if (router.currentRoute.value.name !== 'app-error') {
    void router.push({ name: 'app-error' })
  }
})

export default router
