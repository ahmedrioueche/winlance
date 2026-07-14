import { createRouter, createWebHistory } from 'vue-router'

import { authRoutes } from '@/features/auth'
import { aiCoachRoutes } from '@/features/ai-coach'
import { analyticsRoutes } from '@/features/analytics'
import { contractsRoutes } from '@/features/contracts'
import { homeRoutes } from '@/features/home'
import { leadsRoutes } from '@/features/leads'
import { outreachRoutes } from '@/features/outreach'
import { portalRoutes } from '@/features/portal'
import { projectsRoutes } from '@/features/projects'
import { proposalsRoutes } from '@/features/proposals'
import { logger } from '@/shared/utils/logger'

import { registerAuthGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...homeRoutes,
    ...authRoutes,
    ...leadsRoutes,
    ...proposalsRoutes,
    ...contractsRoutes,
    ...projectsRoutes,
    ...portalRoutes,
    ...outreachRoutes,
    ...aiCoachRoutes,
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
  scrollBehavior() {
    return { top: 0 }
  },
})

registerAuthGuard(router)

router.onError((error) => {
  logger.error('Router error', error)
  if (router.currentRoute.value.name !== 'app-error') {
    void router.push({ name: 'app-error' })
  }
})

export default router
