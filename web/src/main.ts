import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/app/App.vue'
import { initMonitoring } from '@/app/monitoring'
import { useAuthStore } from '@/features/auth'
import { i18n } from '@/i18n'
import router from '@/router'

import vue3GoogleLogin from 'vue3-google-login'

import '@/assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueQueryPlugin)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
})

initMonitoring(app)

const auth = useAuthStore()
void auth.bootstrap().finally(() => {
  app.mount('#app')
})
