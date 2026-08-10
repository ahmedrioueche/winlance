<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Globe, Plus } from 'lucide-vue-next'
import { BaseButton, BaseCardHeader } from '@/shared/components/base'
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
  <BaseCardHeader
    :title="client?.name || 'Client Workspace'"
    :subtitle="t('clients.overview.subtitle', { name: client?.name || '' })"
  >
    <template #badge>
      <span v-if="client?.company_name" class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
        {{ client.company_name }}
      </span>
    </template>

    <template #actions>
      <BaseButton variant="secondary" size="sm" @click="emit('copyPortalLink')">
        <Globe class="h-3.5 w-3.5 text-accent" />
        <span>{{ t('clients.clientPortalLink') }}</span>
      </BaseButton>
      <BaseButton size="sm" @click="$router.push(`/app/clients/${clientId}/proposals/new`)">
        <Plus class="h-3.5 w-3.5" />
        <span>Create Proposal</span>
      </BaseButton>
    </template>
  </BaseCardHeader>
</template>
