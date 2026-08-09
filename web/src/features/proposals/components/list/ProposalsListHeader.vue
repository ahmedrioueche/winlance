<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton, BasePageHeader } from '@/shared/components/base'

defineEmits<{
  createProposal: []
}>()

const { t } = useI18n()
</script>

<template>
  <BasePageHeader
    :title="t('proposals.title')"
    :subtitle="t('proposals.subtitle')"
  >
    <template #actions>
      <BaseButton size="sm" @click="$router.push('/app/proposals/new')">
        <Plus class="h-4 w-4" />
        <span>{{ t('proposals.newProposal') }}</span>
      </BaseButton>
    </template>
  </BasePageHeader>
</template>
