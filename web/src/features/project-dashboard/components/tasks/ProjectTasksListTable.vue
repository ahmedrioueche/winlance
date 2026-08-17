<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { ProjectTask, TaskStatus } from '../../types'
import ProjectTasksListRow from './ProjectTasksListRow.vue'

interface Props {
  tasks: ProjectTask[]
  totalCount: number
  draggedRowIndex: number | null
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  milestoneMap?: Map<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  statusChange: [task: ProjectTask, status: TaskStatus]
  edit: [task: ProjectTask]
  delete: [task: ProjectTask]
  dragStart: [index: number]
  dragOver: [event: DragEvent]
  drop: [index: number]
  moveRow: [index: number, direction: 'up' | 'down']
  fetchNextPage: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-x-auto rounded-2xl border border-border bg-canvas-elevated shadow-soft">
      <div v-if="tasks.length === 0" class="p-12 text-center text-xs text-muted">
        {{ t('projects.tasks.noTasksFound') }}
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-border/70 bg-canvas-muted/70 text-[11px] font-bold text-muted uppercase tracking-wider">
            <th class="w-12 px-3 py-3 text-center">{{ t('projects.tasks.tableHeaders.reorder') }}</th>
            <th class="px-4 py-3">{{ t('projects.tasks.tableHeaders.taskTitle') }}</th>
            <th class="w-44 px-4 py-3">{{ t('projects.tasks.tableHeaders.status') }}</th>
            <th class="px-4 py-3">{{ t('projects.tasks.tableHeaders.priority') }}</th>
            <th class="px-4 py-3">{{ t('projects.tasks.tableHeaders.dueDate') }}</th>
            <th class="px-4 py-3 text-right">{{ t('projects.tasks.tableHeaders.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/30">
          <ProjectTasksListRow
            v-for="(task, index) in tasks"
            :key="task.id"
            :task="task"
            :index="index"
            :total-rows="tasks.length"
            :is-dragged="draggedRowIndex === index"
            :milestone-title="milestoneMap?.get(task.milestone || task.milestone_id || '')"
            @status-change="emit('statusChange', task, $event)"
            @edit="emit('edit', task)"
            @delete="emit('delete', task)"
            @drag-start="emit('dragStart', $event)"
            @drag-over="emit('dragOver', $event)"
            @drop="emit('drop', $event)"
            @move-row="(idx, dir) => emit('moveRow', idx, dir)"
          />
        </tbody>
      </table>
    </div>

    <!-- Show More Tasks CTA -->
    <div v-if="hasNextPage" class="mt-4 flex justify-center">
      <BaseButton
        variant="secondary"
        size="sm"
        :loading="isFetchingNextPage"
        @click="emit('fetchNextPage')"
      >
        <ChevronDown class="h-4 w-4" />
        <span>{{ t('projects.tasks.showMoreTasks', { current: tasks.length, total: totalCount }) }}</span>
      </BaseButton>
    </div>
  </div>
</template>
