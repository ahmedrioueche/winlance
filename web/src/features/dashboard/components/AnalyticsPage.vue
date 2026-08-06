<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto w-full max-w-2xl rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('dashboard.analytics.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('dashboard.analytics.description') }}</p>
    <!-- Placeholder for analytics charts / metrics -->
    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div class="p-4 bg-canvas rounded-lg shadow-sm">Chart 1 (demo)</div>
      <div class="p-4 bg-canvas rounded-lg shadow-sm">Chart 2 (demo)</div>
    </div>
  </section>
</template>

<style scoped>
/* Premium subtle styling – keep it lightweight */
</style>
