<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BasePageHeader } from '@/shared/components/base'
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader
      :title="t('clients.nav.files', 'Files')"
      subtitle="Shared assets, project deliverables, branding files, and documents."
    />

    <div class="rounded-xl border border-border bg-canvas-elevated p-8 text-center text-muted shadow-soft">
      <p class="text-base font-semibold text-ink">Client Files View</p>
      <p class="mt-1 text-sm">File storage grid, uploads, and download links will be displayed here.</p>
    </div>
  </div>
</template>
