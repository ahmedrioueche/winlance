<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton, BasePageHeader } from '@/shared/components/base'

defineEmits<{
  createClient: []
}>()

const { t } = useI18n()
</script>

<template>
  <BasePageHeader
    :title="t('clients.title')"
    :subtitle="t('clients.subtitle')"
  >
    <template #actions>
      <BaseButton size="sm" @click="$emit('createClient')">
        <Plus class="h-4 w-4" />
        <span>{{ t('clients.newClient') }}</span>
      </BaseButton>
    </template>
  </BasePageHeader>
</template>
