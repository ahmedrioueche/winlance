import type { RouteRecordRaw } from 'vue-router'

export const portalRoutes: RouteRecordRaw[] = [
  {
    path: '/portal/:token',
    component: () => import('./components/PortalLayout.vue'),
    meta: { layout: 'blank', requiresAuth: false },
    children: [
      {
        path: '',
        name: 'portal-proposals',
        component: () => import('./components/pages/PortalProposalsPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'proposals/:proposalId',
        name: 'portal-proposal-view',
        component: () => import('./components/pages/PortalProposalViewPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'projects',
        name: 'portal-projects',
        component: () => import('./components/pages/PortalProjectsPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
    ],
  },
]
