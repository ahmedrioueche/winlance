<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Folder, Save } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { ProjectStatus } from '../../types'

interface Props {
  isSaving: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  save: []
}>()

const title = defineModel<string>('title', { default: '' })
const summary = defineModel<string>('summary', { default: '' })
const status = defineModel<ProjectStatus>('status', { default: 'DRAFT' })
const budget = defineModel<string>('budget', { default: '' })
const currency = defineModel<string>('currency', { default: 'USD' })
const startDate = defineModel<string>('startDate', { default: '' })
const dueDate = defineModel<string>('dueDate', { default: '' })
const clientName = defineModel<string>('clientName', { default: '' })
const clientEmail = defineModel<string>('clientEmail', { default: '' })

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'DRAFT', label: t('projects.status.draft', 'Draft') },
  { value: 'ACTIVE', label: t('projects.status.active', 'Active') },
  { value: 'ON_HOLD', label: t('projects.status.on_hold', 'On Hold') },
  { value: 'COMPLETED', label: t('projects.status.completed', 'Completed') },
  { value: 'CANCELLED', label: t('projects.status.cancelled', 'Cancelled') },
])

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink flex items-center gap-2">
        <Folder class="h-5 w-5 text-accent" />
        General Project Configuration
      </h2>
      <p class="mt-1 text-xs text-muted">
        Update project title, status lifecycle, schedule dates, and budget details
      </p>
    </div>

    <form class="space-y-5" @submit.prevent="emit('save')">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div class="sm:col-span-8">
          <BaseInput
            v-model="title"
            label="Project Title"
            placeholder="e.g. Rookie Corp ERP Implementation"
            required
          />
        </div>
        <div class="sm:col-span-4">
          <BaseSelect
            v-model="status"
            label="Status Lifecycle"
            :options="statusOptions"
          />
        </div>
      </div>

      <BaseTextarea
        v-model="summary"
        label="Project Executive Summary"
        placeholder="Brief description of scope deliverables, objectives, and client goals..."
        :rows="3"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div class="sm:col-span-7">
          <BaseInput
            v-model="budget"
            type="number"
            step="0.01"
            label="Contracted Budget"
            placeholder="e.g. 3900.00"
          />
        </div>
        <div class="sm:col-span-5">
          <BaseSelect
            v-model="currency"
            label="Currency"
            :options="currencyOptions"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput
          v-model="startDate"
          type="date"
          label="Project Start Date"
        />
        <BaseInput
          v-model="dueDate"
          type="date"
          label="Target Due Date"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
        <BaseInput
          v-model="clientName"
          label="Client Entity / Company Name"
          placeholder="e.g. Rookie Corp Ltd."
        />
        <BaseInput
          v-model="clientEmail"
          type="email"
          label="Client Contact Email"
          placeholder="e.g. contact@rookiecorp.com"
        />
      </div>

      <div class="flex justify-end pt-4">
        <BaseButton size="sm" type="submit" :loading="isSaving">
          <Save class="h-4 w-4" />
          <span>Save Project Changes</span>
        </BaseButton>
      </div>
    </form>
  </div>
</template>
