import type {RouteRecordRaw} from 'vue-router'
export const analyticsRoutes:RouteRecordRaw[]=[{path:'/app/analytics',name:'analytics',component:()=>import('./components/AnalyticsDashboardPage.vue'),meta:{layout:'app',requiresAuth:true}}]
