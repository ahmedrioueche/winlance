import type { RouteRecordRaw } from 'vue-router'

export const clientDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/clients/:id',
    name: 'client-detail',
    component: () => import('./components/ClientDetailPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.clientDetail' },
  },
  {
    path: '/client',
    component: () => import('./components/ClientDashboardLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/client/overview',
      },
      {
        path: 'overview',
        name: 'client-portal-overview',
        component: () => import('./components/pages/ClientOverviewPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.overview' },
      },
      {
        path: 'projects',
        name: 'client-portal-projects',
        component: () => import('./components/pages/ClientProjectsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.projects' },
      },
      {
        path: 'proposals',
        name: 'client-portal-proposals',
        component: () => import('./components/pages/ClientProposalsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.proposals' },
      },
      {
        path: 'contracts',
        name: 'client-portal-contracts',
        component: () => import('./components/pages/ClientContractsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.contracts' },
      },
      {
        path: 'invoices',
        name: 'client-portal-invoices',
        component: () => import('./components/pages/ClientInvoicesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.invoices' },
      },
      {
        path: 'notes',
        name: 'client-portal-notes',
        component: () => import('./components/pages/ClientNotesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.notes' },
      },
      {
        path: 'files',
        name: 'client-portal-files',
        component: () => import('./components/pages/ClientFilesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.files' },
      },
      {
        path: 'activity',
        name: 'client-portal-activity',
        component: () => import('./components/pages/ClientActivityPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.activity' },
      },
    ],
  },
]
