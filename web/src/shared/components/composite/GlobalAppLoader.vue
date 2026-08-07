<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/features/auth'
import { AppLogo } from '@/shared/components/base'

const { t } = useI18n()
const authStore = useAuthStore()

// Only show loader on initial app load / refresh while auth store is bootstrapping
const showLoader = computed(() => !authStore.isReady)
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showLoader"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas/95 backdrop-blur-md select-none"
      role="status"
      aria-label="Loading application"
    >
      <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <!-- Center Loading Card -->
      <div class="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-border/80 bg-canvas-elevated/80 p-8 shadow-lift backdrop-blur-xl text-center max-w-xs w-full mx-4">
        <!-- Logo Wrapper with Primary Accent Glow Ring -->
        <div class="relative">
          <div class="absolute -inset-3 rounded-2xl bg-accent/25 blur-xl animate-pulse" aria-hidden="true" />
          <div class="relative">
            <AppLogo to="" class="scale-110 pointer-events-none" />
          </div>
        </div>

        <!-- Premium Animated Primary Loading Bar -->
        <div class="w-full space-y-3 pt-2">
          <div class="h-2 w-full overflow-hidden rounded-full bg-accent-soft border border-accent/20 relative shadow-inner">
            <div class="h-full rounded-full bg-accent shadow-sm animate-loading-bar" />
          </div>
          <p class="text-xs font-semibold text-muted tracking-wide">
            {{ t('common.loading.page', 'Initializing workspace...') }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes loadingBar {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 65%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

.animate-loading-bar {
  animation: loadingBar 1.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
