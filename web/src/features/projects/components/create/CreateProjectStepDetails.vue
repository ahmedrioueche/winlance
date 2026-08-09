<script setup lang="ts">
import { BaseInput, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

const budget = defineModel<number | string>('budget', { default: '' })
const currency = defineModel<string>('currency', { default: 'USD' })
const startDate = defineModel<string>('startDate', { default: '' })
const dueDate = defineModel<string>('dueDate', { default: '' })
const summary = defineModel<string>('summary', { default: '' })

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]
</script>

<template>
  <div class="space-y-4 text-xs">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseInput
        :model-value="String(budget ?? '')"
        type="number"
        step="0.01"
        label="Contracted Budget"
        placeholder="e.g. 4500.00"
        @update:model-value="budget = $event"
      />

      <BaseSelect
        v-model="currency"
        label="Currency"
        :options="currencyOptions"
      />
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseInput
        v-model="startDate"
        type="date"
        label="Start Date"
      />

      <BaseInput
        v-model="dueDate"
        type="date"
        label="Target Due Date"
      />
    </div>

    <BaseTextarea
      v-model="summary"
      label="Executive Summary & Objectives"
      placeholder="Outline deliverables, technical scope, and client expectations..."
      :rows="3"
    />
  </div>
</template>
