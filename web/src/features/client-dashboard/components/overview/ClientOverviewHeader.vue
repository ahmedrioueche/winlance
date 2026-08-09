<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Globe, Plus } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Client } from '../../types'

interface Props {
  client?: Client
  clientId: string
}

defineProps<Props>()

const emit = defineEmits<{
  copyPortalLink: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div class="space-y-1">
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ client?.name || 'Client Workspace' }}
        </h1>
        <span v-if="client?.company_name" class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
          {{ client.company_name }}
        </span>
      </div>
      <p class="text-sm text-muted">
        {{ t('clients.overview.subtitle', { name: client?.name || '' }) }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2.5">
      <BaseButton variant="secondary" size="sm" @click="emit('copyPortalLink')">
        <Globe class="h-3.5 w-3.5 text-accent" />
        <span>{{ t('clients.clientPortalLink') }}</span>
      </BaseButton>
      <BaseButton size="sm" @click="$router.push(`/app/proposals/new?client_id=${clientId}`)">
        <Plus class="h-3.5 w-3.5" />
        <span>Create Proposal</span>
      </BaseButton>
    </div>
  </div>
</template>
