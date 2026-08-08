import type { RouteRecordRaw } from 'vue-router'

export const proposalsRoutes: RouteRecordRaw[] = [
  {
    path: '/app/proposals',
    name: 'proposals',
    component: () => import('./components/ProposalsListPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/proposals/:id',
    name: 'proposal-detail',
    component: () => import('./components/ProposalEditorPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
]
