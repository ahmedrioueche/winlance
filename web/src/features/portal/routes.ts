import type { RouteRecordRaw } from 'vue-router'

export const portalRoutes: RouteRecordRaw[] = [
  // Top-level portal layout for proposals list, proposal detail, and projects list
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
      {
        path: 'contracts/:contractId',
        name: 'portal-contract-view',
        component: () => import('./components/pages/PortalContractViewPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
    ],
  },

  // Dedicated Client Portal Project Workspace Layout (Single sidebar & top navbar)
  {
    path: '/portal/:token/projects/:projectId',
    name: 'portal-project-detail',
    component: () => import('./components/PortalProjectLayout.vue'),
    meta: { layout: 'blank', requiresAuth: false },
    children: [
      {
        path: '',
        name: 'portal-project-overview',
        component: () => import('./components/pages/project/PortalProjectOverviewPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'tasks',
        name: 'portal-project-tasks',
        component: () => import('./components/pages/project/PortalProjectTasksPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'milestones',
        name: 'portal-project-milestones',
        component: () => import('./components/pages/project/PortalProjectMilestonesPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'files',
        name: 'portal-project-files',
        component: () => import('./components/pages/project/PortalProjectFilesPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'reports',
        name: 'portal-project-reports',
        component: () => import('./components/pages/project/PortalProjectReportsPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
      {
        path: 'requirements',
        name: 'portal-project-requirements',
        component: () => import('./components/pages/project/PortalProjectRequirementsPage.vue'),
        meta: { layout: 'blank', requiresAuth: false },
      },
    ],
  },
]
