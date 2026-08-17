<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar, ChevronDown, ChevronUp, Edit3, GripVertical, Sparkles, Trash2 } from 'lucide-vue-next'
import { BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { ProjectTask, TaskPriority, TaskStatus } from '../../types'

interface Props {
  task: ProjectTask
  index: number
  totalRows: number
  isDragged: boolean
  milestoneTitle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  statusChange: [status: TaskStatus]
  edit: []
  delete: []
  dragStart: [index: number]
  dragOver: [event: DragEvent]
  drop: [index: number]
  moveRow: [index: number, direction: 'up' | 'down']
}>()

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'TODO', label: t('projects.tasks.statuses.todo') },
  { value: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress') },
  { value: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview') },
  { value: 'DONE', label: t('projects.tasks.statuses.done') },
])

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
  <tr
    draggable="true"
    class="border-b border-border/50 text-xs transition-colors hover:bg-canvas-muted/50"
    :class="{ 'opacity-40 bg-accent/10': isDragged }"
    @dragstart="emit('dragStart', index)"
    @dragover.prevent="emit('dragOver', $event)"
    @drop.prevent="emit('drop', index)"
  >
    <!-- Drag Handle & Move Arrows -->
    <td class="w-12 px-3 py-3.5 text-center text-muted">
      <div class="flex items-center justify-center gap-1">
        <GripVertical class="h-4 w-4 cursor-grab text-muted/60 transition-colors hover:text-ink active:cursor-grabbing" />
        <div class="flex flex-col">
          <button
            type="button"
            class="p-0.5 text-muted hover:text-ink disabled:opacity-20"
            :disabled="index === 0"
            @click="emit('moveRow', index, 'up')"
          >
            <ChevronUp class="h-3 w-3" />
          </button>
          <button
            type="button"
            class="p-0.5 text-muted hover:text-ink disabled:opacity-20"
            :disabled="index === totalRows - 1"
            @click="emit('moveRow', index, 'down')"
          >
            <ChevronDown class="h-3 w-3" />
          </button>
        </div>
      </div>
    </td>

    <!-- Task Title & Description -->
    <td class="px-4 py-3.5">
      <div class="flex items-start gap-2.5">
        <span class="mt-1 font-mono text-[11px] font-semibold text-muted">#{{ index + 1 }}</span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-ink text-xs truncate" :class="{ 'line-through text-muted': task.status === 'DONE' }">
              {{ task.title }}
            </span>
            <span v-if="milestoneTitle" class="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              <Sparkles class="h-3 w-3" />
              <span>{{ milestoneTitle }}</span>
            </span>
          </div>
          <p v-if="task.description" class="mt-0.5 max-w-lg text-[11px] text-muted truncate">
            {{ task.description }}
          </p>
        </div>
      </div>
    </td>

    <!-- Quick Status Select -->
    <td class="w-44 px-4 py-2">
      <BaseSelect
        :model-value="task.status"
        label=""
        :options="statusOptions"
        @update:model-value="emit('statusChange', $event as TaskStatus)"
      />
    </td>

    <!-- Priority -->
    <td class="px-4 py-3.5">
      <span
        class="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
        :class="getPriorityBadgeClass(task.priority)"
      >
        {{ task.priority }}
      </span>
    </td>

    <!-- Due Date -->
    <td class="px-4 py-3.5 text-muted">
      <div v-if="task.due_date" class="flex items-center gap-1.5 font-medium text-[11px]">
        <Calendar class="h-3.5 w-3.5 text-accent" />
        <span>{{ task.due_date }}</span>
      </div>
      <span v-else class="text-muted/50">—</span>
    </td>

    <!-- Actions -->
    <td class="px-4 py-3.5 text-right">
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="p-1 text-muted hover:text-ink transition-colors"
          :title="t('projects.tasks.editTask')"
          @click="emit('edit')"
        >
          <Edit3 class="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          class="p-1 text-muted hover:text-red-500 transition-colors"
          :title="t('projects.tasks.deleteTask')"
          @click="emit('delete')"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  </tr>
</template>
