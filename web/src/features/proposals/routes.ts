import type { RouteRecordRaw } from 'vue-router'

export const proposalsRoutes: RouteRecordRaw[] = [
  {
    path: '/app/proposals',
    name: 'proposals',
    component: () => import('./components/pages/ProposalsListPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/proposals/new',
    name: 'proposal-create',
    component: () => import('./components/pages/ProposalEditorPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/proposals/:id',
    name: 'proposal-detail',
    component: () => import('./components/pages/ProposalEditorPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
]
