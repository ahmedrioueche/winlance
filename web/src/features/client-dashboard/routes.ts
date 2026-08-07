import type { RouteRecordRaw } from 'vue-router'

export const clientDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/clients/:id',
    component: () => import('./components/ClientDashboardLayout.vue'),
    children: [
      {
        path: '',
        redirect: (to) => `/app/clients/${String(to.params.id)}/overview`,
      },
      {
        path: 'overview',
        name: 'client-overview',
        component: () => import('./components/pages/ClientOverviewPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.overview' },
      },
      {
        path: 'projects',
        name: 'client-workspace-projects',
        component: () => import('./components/pages/ClientProjectsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.projects' },
      },
      {
        path: 'proposals',
        name: 'client-workspace-proposals',
        component: () => import('./components/pages/ClientProposalsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.proposals' },
      },
      {
        path: 'contracts',
        name: 'client-workspace-contracts',
        component: () => import('./components/pages/ClientContractsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.contracts' },
      },
      {
        path: 'invoices',
        name: 'client-workspace-invoices',
        component: () => import('./components/pages/ClientInvoicesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.invoices' },
      },
      {
        path: 'notes',
        name: 'client-workspace-notes',
        component: () => import('./components/pages/ClientNotesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.notes' },
      },
      {
        path: 'files',
        name: 'client-workspace-files',
        component: () => import('./components/pages/ClientFilesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.files' },
      },
      {
        path: 'activity',
        name: 'client-workspace-activity',
        component: () => import('./components/pages/ClientActivityPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'clients.nav.activity' },
      },
    ],
  },
]
