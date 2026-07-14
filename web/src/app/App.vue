<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import ErrorBoundary from '@/app/ErrorBoundary.vue'
import AppLayout from '@/app/layouts/AppLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import BlankLayout from '@/app/layouts/BlankLayout.vue'
import LoadingPage from '@/app/pages/LoadingPage.vue'
import { Toaster } from '@/shared/components/composite'

const route = useRoute()

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'app':
      return AppLayout
    case 'auth':
      return AuthLayout
    default:
      return BlankLayout
  }
})
</script>

<template>
  <Toaster />
  <ErrorBoundary>
    <component :is="layout">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <LoadingPage />
          </template>
        </Suspense>
      </RouterView>
    </component>
  </ErrorBoundary>
</template>
