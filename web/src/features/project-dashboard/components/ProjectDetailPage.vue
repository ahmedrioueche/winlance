<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
const { t } = useI18n();
const route = useRoute();
const projectId = route.params.id as string;
</script>

<template>
  <section class="mx-auto w-full max-w-2xl rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('project.detail.title') }}: {{ projectId }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('project.detail.description') }}</p>
    <!-- Placeholder content -->
    <div class="mt-6">
      <p class="text-muted">Project details UI will be implemented here.</p>
    </div>
  </section>
</template>

<style scoped>
/* Minimal styling – inherits design system */
</style>
