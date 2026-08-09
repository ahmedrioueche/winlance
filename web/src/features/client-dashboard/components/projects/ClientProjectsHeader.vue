<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton, BaseCardHeader } from '@/shared/components/base'
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
  <BaseCardHeader
    :title="t('clients.projects.title')"
    :subtitle="t('clients.projects.subtitle', { name: client?.name || '' })"
  >
    <template #actions>
      <BaseButton size="sm" @click="$emit('createProject')">
        <Plus class="h-4 w-4" />
        <span>{{ t('clients.projects.createProject') }}</span>
      </BaseButton>
    </template>
  </BaseCardHeader>
</template>
