<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
        {{ t('clients.nav.overview', 'Overview') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        Welcome to your client dashboard overview. Monitor active projects, proposals, contracts, and recent activity.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <p class="text-xs font-medium text-muted">Active Projects</p>
        <p class="mt-2 text-2xl font-bold text-ink">3</p>
      </div>
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <p class="text-xs font-medium text-muted">Pending Proposals</p>
        <p class="mt-2 text-2xl font-bold text-accent">1</p>
      </div>
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <p class="text-xs font-medium text-muted">Signed Contracts</p>
        <p class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">2</p>
      </div>
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <p class="text-xs font-medium text-muted">Open Invoices</p>
        <p class="mt-2 text-2xl font-bold text-ink">$2,450</p>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-canvas-elevated p-8 text-center text-muted shadow-soft">
      <p class="text-base font-semibold text-ink">Client Overview Dashboard View</p>
      <p class="mt-1 text-sm">Detailed widgets and charts will be implemented here.</p>
    </div>
  </div>
</template>
