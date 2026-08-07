import type { RouteRecordRaw } from 'vue-router';

export const projectDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/app/projects/:id',
    name: 'project-detail',
    component: () => import('./components/ProjectDetailPage.vue'),
    meta: { layout: 'app', requiresAuth: true, titleKey: 'common.nav.projectDetail' },
  },
];
