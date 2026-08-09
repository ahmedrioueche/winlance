import type { RouteRecordRaw } from 'vue-router'

export const projectsRoutes: RouteRecordRaw[] = [
  {
    path: '/app/projects',
    name: 'projects',
    component: () => import('./components/pages/ProjectsListPage.vue'),
    meta: { layout: 'app', shellVariant: 'workspace', requiresAuth: true },
  },
  {
    path: '/app/projects/:id',
    name: 'project-detail',
    component: () => import('./components/pages/ProjectDetailPage.vue'),
    meta: { layout: 'app', shellVariant: 'project', requiresAuth: true },
  },
]
