<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Client } from '../../types'

interface Props {
  client?: Client
}

defineProps<Props>()

defineEmits<{
  createProject: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
        {{ t('clients.projects.title') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('clients.projects.subtitle', { name: client?.name || '' }) }}
      </p>
    </div>

    <BaseButton size="sm" @click="$emit('createProject')">
      <Plus class="h-4 w-4" />
      <span>{{ t('clients.projects.createProject') }}</span>
    </BaseButton>
  </div>
</template>
