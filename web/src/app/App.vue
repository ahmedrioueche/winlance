<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import ErrorBoundary from '@/app/ErrorBoundary.vue'
import AppLayout from '@/app/layouts/AppLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import BlankLayout from '@/app/layouts/BlankLayout.vue'
import LoadingPage from '@/app/pages/LoadingPage.vue'
import { Toaster } from '@/shared/components/composite'
import type { ShellVariant } from '@/shared/components/navigation/useSidebarNav'

const route = useRoute()

const layoutKind = computed(() => route.meta.layout ?? 'blank')
const shellVariant = computed<ShellVariant>(() => route.meta.shellVariant ?? 'workspace')
</script>

<template>
  <Toaster />
  <ErrorBoundary>
    <AppLayout v-if="layoutKind === 'app'" :variant="shellVariant">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <LoadingPage embedded />
          </template>
        </Suspense>
      </RouterView>
    </AppLayout>

    <AuthLayout v-else-if="layoutKind === 'auth'">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <LoadingPage />
          </template>
        </Suspense>
      </RouterView>
    </AuthLayout>

    <BlankLayout v-else>
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <LoadingPage />
          </template>
        </Suspense>
      </RouterView>
    </BlankLayout>
  </ErrorBoundary>
</template>
