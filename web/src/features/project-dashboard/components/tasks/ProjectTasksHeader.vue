<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Kanban, ListFilter, Plus } from 'lucide-vue-next'
import { BaseButton, BasePageHeader } from '@/shared/components/base'

interface Props {
  viewMode: 'list' | 'kanban'
  totalCount: number
  tasksCount: number
  completedCount: number
  progressPercent: number
  inProgressCount: number
  highUrgentCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:viewMode': [mode: 'list' | 'kanban']
  createTask: []
}>()

const { t } = useI18n()
</script>

<template>
  <BasePageHeader :title="t('projects.tasks.title')">
    <template #badge>
      <span class="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
        AI Parsed
      </span>
    </template>

    <template #subtitle>
      <div class="flex flex-wrap items-center gap-3 text-xs font-medium text-muted">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full bg-accent" />
          <span class="font-semibold text-ink">
            {{ t('projects.tasks.totalTasks', { count: totalCount }) }}
          </span>
        </span>
        <span class="text-border">|</span>
        <span class="inline-flex items-center gap-1.5 font-medium text-accent">
          <span>{{ t('projects.tasks.showingTasks', { count: tasksCount }) }}</span>
        </span>
        <span class="text-border">|</span>
        <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span class="h-2 w-2 rounded-full bg-emerald-500" />
          <strong>{{ t('projects.tasks.doneStatus', { count: completedCount, percent: progressPercent }) }}</strong>
        </span>
        <span class="text-border">|</span>
        <span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <span class="h-2 w-2 rounded-full bg-amber-500" />
          <strong>{{ t('projects.tasks.inProgressStatus', { count: inProgressCount }) }}</strong>
        </span>
        <template v-if="highUrgentCount > 0">
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span class="h-2 w-2 rounded-full bg-red-500" />
            <strong>{{ t('projects.tasks.highUrgentStatus', { count: highUrgentCount }) }}</strong>
          </span>
        </template>
      </div>
    </template>

    <template #actions>
      <!-- View Toggle (List Table vs Kanban Board) -->
      <div class="flex items-center gap-1 rounded-xl border border-border bg-canvas p-1 text-xs">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
          :class="viewMode === 'list' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
          @click="emit('update:viewMode', 'list')"
        >
          <ListFilter class="h-3.5 w-3.5" />
          <span>{{ t('projects.tasks.listTable') }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
          :class="viewMode === 'kanban' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
          @click="emit('update:viewMode', 'kanban')"
        >
          <Kanban class="h-3.5 w-3.5" />
          <span>{{ t('projects.tasks.board') }}</span>
        </button>
      </div>

      <BaseButton size="sm" @click="emit('createTask')">
        <Plus class="h-3.5 w-3.5" />
        <span>{{ t('projects.tasks.newTask') }}</span>
      </BaseButton>
    </template>
  </BasePageHeader>
</template>
