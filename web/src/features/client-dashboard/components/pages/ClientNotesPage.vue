<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
        {{ t('clients.nav.notes', 'Notes') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        Shared workspace notes, project feedback, and meeting summaries.
      </p>
    </div>

    <div class="rounded-xl border border-border bg-canvas-elevated p-8 text-center text-muted shadow-soft">
      <p class="text-base font-semibold text-ink">Client Notes View</p>
      <p class="mt-1 text-sm">Collaborative notes and memo feeds will be displayed here.</p>
    </div>
  </div>
</template>
