<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'

defineEmits<{
  createProposal: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {{ t('proposals.title') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('proposals.subtitle') }}
      </p>
    </div>

    <BaseButton size="sm" @click="$router.push('/app/proposals/new')">
      <Plus class="h-4 w-4" />
      <span>{{ t('proposals.newProposal') }}</span>
    </BaseButton>
  </div>
</template>
