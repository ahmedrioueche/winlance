<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const statusFilter = defineModel<string>('statusFilter', { default: '' })

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.allStatuses', 'All Statuses') },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative flex-1 max-w-md">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('projects.searchPlaceholder', 'Search projects by title, client, or summary...')"
        class="w-full rounded-xl border border-border bg-canvas-elevated py-2 pr-4 pl-9 text-xs text-ink placeholder:text-muted/60 shadow-xs focus:border-accent focus:outline-none"
      />
    </div>

    <div class="w-40 shrink-0">
      <BaseSelect
        v-model="statusFilter"
        label=""
        :options="statusOptions"
      />
    </div>
  </div>
</template>
