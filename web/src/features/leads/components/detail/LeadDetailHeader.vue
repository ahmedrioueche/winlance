<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseSelect } from '@/shared/components/base'
import { LEAD_STATUSES, type Lead, type LeadStatus } from '../../types'

interface Props {
  lead?: Lead
}

defineProps<Props>()

const emit = defineEmits<{
  statusChange: []
  rescore: []
}>()

const statusModel = defineModel<LeadStatus>('statusModel', { default: 'NEW' })

const { t } = useI18n()

const statusOptions = LEAD_STATUSES.map((val) => ({
  value: val,
  label: t(`leads.status.${val}`),
}))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-3xl text-ink">{{ lead?.title }}</h1>
      <p class="mt-2 whitespace-pre-wrap text-ink-soft">
        {{ lead?.description || t('leads.detail.noDescription') }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
        {{ t('leads.list.score', { score: lead?.score ?? 0 }) }}
      </p>
      <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
        {{ t('leads.detail.value', { value: lead?.estimated_value ?? 0 }) }}
      </p>
      <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
        {{ t('leads.detail.probability', { value: lead?.probability ?? 0 }) }}
      </p>
    </div>

    <div class="flex items-center gap-4">
      <div class="w-64">
        <BaseSelect
          v-model="statusModel"
          :label="t('leads.detail.status')"
          :options="statusOptions"
          @update:model-value="emit('statusChange')"
        />
      </div>
      <BaseButton variant="secondary" class="mt-6" @click="emit('rescore')">
        {{ t('leads.detail.rescore') }}
      </BaseButton>
    </div>
  </div>
</template>
