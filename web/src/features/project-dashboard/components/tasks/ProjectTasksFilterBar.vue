<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const statusFilter = defineModel<string>('statusFilter', { default: '' })
const priorityFilter = defineModel<string>('priorityFilter', { default: '' })

const { t } = useI18n()

const filterStatusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.tasks.allStatuses') },
  { value: 'TODO', label: t('projects.tasks.statuses.todo') },
  { value: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress') },
  { value: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview') },
  { value: 'DONE', label: t('projects.tasks.statuses.done') },
])

const filterPriorityOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.tasks.allPriorities') },
  { value: 'LOW', label: t('projects.tasks.priorities.low') },
  { value: 'MEDIUM', label: t('projects.tasks.priorities.medium') },
  { value: 'HIGH', label: t('projects.tasks.priorities.high') },
  { value: 'URGENT', label: t('projects.tasks.priorities.urgent') },
])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('projects.tasks.searchPlaceholder')"
        class="w-full rounded-xl border border-border bg-canvas-elevated py-2 pr-4 pl-9 text-xs text-ink placeholder:text-muted/60 shadow-xs focus:border-accent focus:outline-none"
      />
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <div class="w-36">
        <BaseSelect
          v-model="statusFilter"
          label=""
          :options="filterStatusOptions"
        />
      </div>

      <div class="w-36">
        <BaseSelect
          v-model="priorityFilter"
          label=""
          :options="filterPriorityOptions"
        />
      </div>
    </div>
  </div>
</template>
