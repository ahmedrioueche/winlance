import type {RouteRecordRaw} from 'vue-router'
export const outreachRoutes:RouteRecordRaw[]=[{path:'/app/outreach',name:'outreach',component:()=>import('./components/OutreachPage.vue'),meta:{layout:'app',requiresAuth:true}}]
