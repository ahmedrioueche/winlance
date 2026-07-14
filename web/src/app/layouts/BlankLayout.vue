<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lift"
    >
      {{ t('common.a11y.skipToContent') }}
    </a>
    <main id="main-content" tabindex="-1" class="outline-none">
      <slot />
    </main>
  </div>
</template>
