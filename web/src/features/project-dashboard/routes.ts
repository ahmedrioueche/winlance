import type { RouteRecordRaw } from 'vue-router'

export const projectDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/projects/:id',
    component: () => import('./components/ProjectDashboardLayout.vue'),
    children: [
      {
        path: '',
        name: 'project-detail',
        redirect: (to) => `/app/projects/${String(to.params.id)}/overview`,
      },
      {
        path: 'overview',
        name: 'project-workspace-overview',
        component: () => import('./components/pages/ProjectOverviewPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'projects.nav.overview' },
      },
      {
        path: 'tasks',
        name: 'project-workspace-tasks',
        component: () => import('./components/pages/ProjectTasksPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'projects.nav.tasks' },
      },
      {
        path: 'milestones',
        name: 'project-workspace-milestones',
        component: () => import('./components/pages/ProjectMilestonesPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'projects.nav.milestones' },
      },
      {
        path: 'settings',
        name: 'project-workspace-settings',
        component: () => import('./components/pages/ProjectSettingsPage.vue'),
        meta: { layout: 'blank', requiresAuth: true, titleKey: 'projects.nav.settings' },
      },
    ],
  },
]
