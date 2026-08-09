<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Building2, Mail, User } from 'lucide-vue-next'
import type { Client } from '@/features/client-dashboard/types'

interface Props {
  client?: Client
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
    <h2 class="font-display text-base font-bold text-ink flex items-center gap-2">
      <User class="h-4 w-4 text-accent" />
      {{ t('proposals.editor.clientSectionTitle') }}
    </h2>

    <div v-if="client" class="rounded-xl border border-border bg-canvas p-4 text-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-ink text-sm">{{ client.name }}</span>
        <span v-if="client.company_name" class="rounded-md bg-accent-soft px-2 py-0.5 font-semibold text-accent">
          {{ client.company_name }}
        </span>
      </div>

      <div class="flex flex-wrap gap-4 text-muted pt-1">
        <span v-if="client.email" class="inline-flex items-center gap-1.5">
          <Mail class="h-3.5 w-3.5 text-muted" />
          <span>{{ client.email }}</span>
        </span>
        <span v-if="client.company_name" class="inline-flex items-center gap-1.5">
          <Building2 class="h-3.5 w-3.5 text-muted" />
          <span>{{ client.company_name }}</span>
        </span>
      </div>
    </div>

    <div v-else class="text-xs text-muted">
      Individual or Unspecified Client Workspace
    </div>
  </div>
</template>
