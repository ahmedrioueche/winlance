import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/app/App.vue'
import { initMonitoring } from '@/app/monitoring'
import { useAuthStore } from '@/features/auth'
import { i18n } from '@/i18n'
import router from '@/router'

import '@/assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueQueryPlugin)

initMonitoring(app)

const auth = useAuthStore()
auth.bootstrap()

app.mount('#app')
