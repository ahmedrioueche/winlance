<script setup lang="ts">
import { BaseButton, BaseInput, BaseSearchInput, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { FilterX, SlidersHorizontal } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  clientOptions?: SelectOption[]
  hasActiveFilters?: boolean
  activeFiltersCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  clientOptions: () => [],
  hasActiveFilters: false,
  activeFiltersCount: 0,
})

defineEmits<{
  clearFilters: []
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const statusFilter = defineModel<string>('statusFilter', { default: '' })
const clientFilter = defineModel<string>('clientFilter', { default: '' })
const dateFilter = defineModel<string>('dateFilter', { default: '' })
const startDate = defineModel<string>('startDate', { default: '' })
const endDate = defineModel<string>('endDate', { default: '' })
const sortBy = defineModel<string>('sortBy', { default: 'created_desc' })

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.allStatuses', 'All Statuses') },
  { value: 'DRAFT', label: t('projects.status.draft', 'Draft') },
  { value: 'ACTIVE', label: t('projects.status.active', 'Active') },
  { value: 'ON_HOLD', label: t('projects.status.on_hold', 'On Hold') },
  { value: 'COMPLETED', label: t('projects.status.completed', 'Completed') },
  { value: 'CANCELLED', label: t('projects.status.cancelled', 'Cancelled') },
])

const datePresetOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.allDates', 'All Dates') },
  { value: 'THIS_MONTH', label: t('projects.datePresets.thisMonth', 'This Month') },
  { value: 'LAST_30_DAYS', label: t('projects.datePresets.last30Days', 'Last 30 Days') },
  { value: 'THIS_YEAR', label: t('projects.datePresets.thisYear', 'This Year') },
  { value: 'CUSTOM', label: t('projects.datePresets.custom', 'Custom Range') },
])

const sortOptions = computed<SelectOption[]>(() => [
  { value: 'created_desc', label: t('projects.sortOptions.createdDesc', 'Newest First') },
  { value: 'created_asc', label: t('projects.sortOptions.createdAsc', 'Oldest First') },
  { value: 'due_asc', label: t('projects.sortOptions.dueAsc', 'Due Soonest') },
  { value: 'title_asc', label: t('projects.sortOptions.titleAsc', 'Title (A-Z)') },
])
</script>

<template>
  <div class="border-border bg-canvas-elevated shadow-soft space-y-3 rounded-2xl border p-4">
    <!-- Top Row: Search input + Primary Filter Dropdowns -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      <!-- Search Query (spanning 4 columns on large screens) -->
      <div class="lg:col-span-4">
        <BaseSearchInput
          v-model="searchQuery"
          size="md"
          :placeholder="
            t('projects.searchPlaceholder', 'Search projects by title, client, or summary...')
          "
        />
      </div>

      <!-- Status Filter -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="statusFilter"
          label=""
          :placeholder="t('projects.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>

      <!-- Client Filter -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="clientFilter"
          label=""
          :placeholder="t('projects.filterByClient', 'Filter by client')"
          :options="props.clientOptions"
        />
      </div>

      <!-- Date Filter Preset -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="dateFilter"
          label=""
          :placeholder="t('projects.filterByDate', 'Filter by date')"
          :options="datePresetOptions"
        />
      </div>

      <!-- Sort By -->
      <div class="lg:col-span-2">
        <BaseSelect
          v-model="sortBy"
          label=""
          :placeholder="t('projects.sortBy', 'Sort by')"
          :options="sortOptions"
        />
      </div>
    </div>

    <!-- Secondary Row: Custom Date Range Inputs (when dateFilter === 'CUSTOM') & Clear Filters CTA -->
    <div
      v-if="dateFilter === 'CUSTOM' || props.hasActiveFilters"
      class="border-border/60 flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Custom Date Inputs -->
      <div v-if="dateFilter === 'CUSTOM'" class="flex flex-wrap items-center gap-2">
        <div class="w-36">
          <BaseInput
            v-model="startDate"
            label=""
            type="date"
            :placeholder="t('projects.startDate', 'Start Date')"
          />
        </div>
        <span class="text-muted text-xs font-medium">—</span>
        <div class="w-36">
          <BaseInput
            v-model="endDate"
            label=""
            type="date"
            :placeholder="t('projects.endDate', 'End Date')"
          />
        </div>
      </div>

      <!-- Filter status badge & Clear Filters Button -->
      <div class="ml-auto flex items-center gap-3">
        <span
          v-if="props.hasActiveFilters"
          class="text-muted inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <SlidersHorizontal class="text-accent h-3.5 w-3.5" />
          <span>{{
            t(
              'projects.activeFiltersCount',
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
          <span>{{ t('projects.clearFilters', 'Clear Filters') }}</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
