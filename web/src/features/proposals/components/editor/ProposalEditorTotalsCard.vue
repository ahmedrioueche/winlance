<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { DollarSign } from 'lucide-vue-next'
import { BaseInput, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

const amount = defineModel<number | string>('amount', { default: 0 })
const currency = defineModel<string>('currency', { default: 'USD' })

const { t } = useI18n()

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
    <h2 class="font-display text-base font-bold text-ink flex items-center gap-2 border-b border-border/60 pb-3">
      <DollarSign class="h-4 w-4 text-emerald-500" />
      {{ t('proposals.editor.totalsTitle') }}
    </h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <BaseInput
        :model-value="String(amount ?? '')"
        type="number"
        step="0.01"
        label="Total Fixed Proposal Amount"
        placeholder="e.g. 4500.00"
        @update:model-value="amount = $event"
      />

      <BaseSelect
        v-model="currency"
        :label="t('proposals.editor.currencyLabel')"
        :options="currencyOptions"
      />
    </div>
  </div>
</template>
