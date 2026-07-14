<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { ThemeToggle } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lift"
    >
      {{ t('common.a11y.skipToContent') }}
    </a>
    <header class="flex items-center justify-between px-6 py-6 md:px-8">
      <RouterLink class="font-display text-xl text-ink" to="/">
        {{ t('common.appName') }}
      </RouterLink>
      <ThemeToggle />
    </header>
    <main
      id="main-content"
      tabindex="-1"
      class="flex flex-1 items-center px-6 pb-16 outline-none md:px-8"
    >
      <slot />
    </main>
  </div>
</template>
