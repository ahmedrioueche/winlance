import type { RouteRecordRaw } from 'vue-router'

export const leadsRoutes: RouteRecordRaw[] = [
  {
    path: '/app/leads',
    name: 'leads',
    component: () => import('./components/LeadsListPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/leads/pipeline',
    name: 'leads-pipeline',
    component: () => import('./components/LeadsPipelinePage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/leads/follow-ups',
    name: 'follow-ups',
    component: () => import('./components/FollowUpsPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/companies',
    name: 'companies',
    component: () => import('./components/CompaniesPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/app/leads/:id',
    name: 'lead-detail',
    component: () => import('./components/LeadDetailPage.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
]
