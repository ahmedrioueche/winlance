<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Calendar, Edit3, Sparkles, Trash2 } from 'lucide-vue-next'
import type { ProjectTask, TaskPriority } from '../../types'

interface Props {
  task: ProjectTask
  isDragged: boolean
  milestoneTitle?: string
}

defineProps<Props>()

const emit = defineEmits<{
  dragStart: [taskId: string]
  edit: []
  delete: []
}>()

const { t } = useI18n()

function getPriorityBadgeClass(priority?: TaskPriority | string) {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
    case 'HIGH':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'LOW':
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
    case 'MEDIUM':
    default:
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
  }
}
</script>

<template>
  <div
    draggable="true"
    class="group relative rounded-xl border border-border bg-canvas-elevated p-3.5 shadow-xs transition-all hover:border-accent/40 hover:shadow-soft cursor-grab active:cursor-grabbing"
    :class="{ 'opacity-40 border-accent border-dashed': isDragged }"
    @dragstart="emit('dragStart', task.id)"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold text-ink text-xs line-clamp-2">
        {{ task.title }}
      </h3>

      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          class="p-1 text-muted hover:text-ink transition-colors"
          :title="t('projects.tasks.editTask')"
          @click.stop="emit('edit')"
        >
          <Edit3 class="h-3 w-3" />
        </button>
        <button
          type="button"
          class="p-1 text-muted hover:text-red-500 transition-colors"
          :title="t('projects.tasks.deleteTask')"
          @click.stop="emit('delete')"
        >
          <Trash2 class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Milestone Badge -->
    <div v-if="milestoneTitle" class="mt-1.5">
      <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 max-w-full truncate">
        <Sparkles class="h-2.5 w-2.5 shrink-0" />
        <span class="truncate">{{ milestoneTitle }}</span>
      </span>
    </div>

    <p v-if="task.description" class="mt-1.5 text-[11px] text-muted line-clamp-2">
      {{ task.description }}
    </p>

    <div class="mt-3 flex items-center justify-between gap-2 text-[10px]">
      <span
        class="rounded-full border px-2 py-0.5 font-bold uppercase tracking-wider"
        :class="getPriorityBadgeClass(task.priority)"
      >
        {{ task.priority }}
      </span>

      <span v-if="task.due_date" class="inline-flex items-center gap-1 font-medium text-muted">
        <Calendar class="h-3 w-3 text-accent" />
        <span>{{ task.due_date }}</span>
      </span>
    </div>
  </div>
</template>
