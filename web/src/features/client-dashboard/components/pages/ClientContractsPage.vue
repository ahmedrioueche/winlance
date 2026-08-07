<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
        {{ t('clients.nav.contracts', 'Contracts') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        Access legal agreements, scope documents, and e-signature statuses.
      </p>
    </div>

    <div class="rounded-xl border border-border bg-canvas-elevated p-8 text-center text-muted shadow-soft">
      <p class="text-base font-semibold text-ink">Client Contracts View</p>
      <p class="mt-1 text-sm">Contract preview, terms, and signature status will be displayed here.</p>
    </div>
  </div>
</template>
