<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FilterX, SlidersHorizontal } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseSearchInput, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

interface Props {
  hasActiveFilters?: boolean
  activeFiltersCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
  activeFiltersCount: 0,
})

defineEmits<{
  clearFilters: []
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const statusFilter = defineModel<string>('statusFilter', { default: '' })
const dateFilter = defineModel<string>('dateFilter', { default: '' })
const startDate = defineModel<string>('startDate', { default: '' })
const endDate = defineModel<string>('endDate', { default: '' })
const sortBy = defineModel<string>('sortBy', { default: 'created_desc' })

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('clients.allStatuses', 'All Statuses') },
  { value: 'LEAD', label: t('clients.status.lead', 'Lead') },
  { value: 'PROPOSAL_SENT', label: t('clients.status.proposal_sent', 'Proposal Sent') },
  { value: 'NEGOTIATING', label: t('clients.status.negotiating', 'Negotiating') },
  { value: 'ACTIVE', label: t('clients.status.active', 'Active') },
  { value: 'COMPLETED', label: t('clients.status.completed', 'Completed') },
  { value: 'ARCHIVED', label: t('clients.status.archived', 'Archived') },
  { value: 'INACTIVE', label: t('clients.inactiveClients', 'Inactive') },
])

const datePresetOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('clients.allDates', 'All Dates') },
  { value: 'THIS_MONTH', label: t('clients.datePresets.thisMonth', 'This Month') },
  { value: 'LAST_30_DAYS', label: t('clients.datePresets.last30Days', 'Last 30 Days') },
  { value: 'THIS_YEAR', label: t('clients.datePresets.thisYear', 'This Year') },
  { value: 'CUSTOM', label: t('clients.datePresets.custom', 'Custom Range') },
])

const sortOptions = computed<SelectOption[]>(() => [
  { value: 'created_desc', label: t('clients.sortOptions.createdDesc', 'Newest First') },
  { value: 'created_asc', label: t('clients.sortOptions.createdAsc', 'Oldest First') },
  { value: 'name_asc', label: t('clients.sortOptions.nameAsc', 'Name (A-Z)') },
  { value: 'company_asc', label: t('clients.sortOptions.companyAsc', 'Company (A-Z)') },
])
</script>

<template>
  <div class="space-y-3 rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft">
    <!-- Top Row: Search input + Primary Filter Dropdowns -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      <!-- Search Query (spanning 6 columns on large screens) -->
      <div class="lg:col-span-6">
        <BaseSearchInput
          v-model="searchQuery"
          size="md"
          :placeholder="
            t('clients.searchPlaceholder', 'Search clients by name, company, or email...')
          "
        />
      </div>

      <!-- Status Filter -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="statusFilter"
          label=""
          :placeholder="t('clients.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>

      <!-- Date Filter Preset -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="dateFilter"
          label=""
          :placeholder="t('clients.filterByDate', 'Filter by date')"
          :options="datePresetOptions"
        />
      </div>

      <!-- Sort By -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="sortBy"
          label=""
          :placeholder="t('clients.sortBy', 'Sort by')"
          :options="sortOptions"
        />
      </div>
    </div>

    <!-- Secondary Row: Custom Date Range Inputs (when dateFilter === 'CUSTOM') & Clear Filters CTA -->
    <div
      v-if="dateFilter === 'CUSTOM' || props.hasActiveFilters"
      class="flex flex-col gap-3 pt-2 border-t border-border/60 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Custom Date Inputs -->
      <div v-if="dateFilter === 'CUSTOM'" class="flex flex-wrap items-center gap-2">
        <div class="w-36">
          <BaseInput
            v-model="startDate"
            label=""
            type="date"
            :placeholder="t('clients.startDate', 'Start Date')"
          />
        </div>
        <span class="text-xs text-muted font-medium">—</span>
        <div class="w-36">
          <BaseInput
            v-model="endDate"
            label=""
            type="date"
            :placeholder="t('clients.endDate', 'End Date')"
          />
        </div>
      </div>

      <!-- Filter status badge & Clear Filters Button -->
      <div class="flex items-center gap-3 ml-auto">
        <span
          v-if="props.hasActiveFilters"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
        >
          <SlidersHorizontal class="h-3.5 w-3.5 text-accent" />
          <span>{{
            t(
              'clients.activeFiltersCount',
              { count: props.activeFiltersCount },
              `${props.activeFiltersCount} active filters`,
            )
          }}</span>
        </span>

        <BaseButton
          v-if="props.hasActiveFilters"
          variant="secondary"
          size="sm"
          @click="$emit('clearFilters')"
        >
          <FilterX class="h-3.5 w-3.5" />
          <span>{{ t('clients.clearFilters', 'Clear Filters') }}</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
