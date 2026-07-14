import type {RouteRecordRaw} from 'vue-router'
export const aiCoachRoutes:RouteRecordRaw[]=[{path:'/app/ai-coach',name:'ai-coach',component:()=>import('./components/CoachSessionsPage.vue'),meta:{layout:'app',requiresAuth:true}},{path:'/app/ai-coach/:id',name:'ai-coach-detail',component:()=>import('./components/CoachSessionDetailPage.vue'),meta:{layout:'app',requiresAuth:true}}]
