<script setup lang="ts">
import { BaseButton } from '@/shared/components/base'
import { ChevronDown } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { ProjectTask, TaskStatus } from '../../types'
import ProjectTasksBoardColumn from './ProjectTasksBoardColumn.vue'

interface Props {
  todoTasks: ProjectTask[]
  inProgressTasks: ProjectTask[]
  inReviewTasks: ProjectTask[]
  doneTasks: ProjectTask[]
  tasksCount: number
  totalCount: number
  draggedTaskId: string | null
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  milestoneMap?: Map<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  dragStart: [taskId: string]
  dropOnColumn: [status: TaskStatus]
  edit: [task: ProjectTask]
  delete: [task: ProjectTask]
  fetchNextPage: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <ProjectTasksBoardColumn
        :title="t('projects.tasks.statuses.todo')"
        status="TODO"
        :tasks="todoTasks"
        dot-class="bg-slate-400"
        :dragged-task-id="draggedTaskId"
        :milestone-map="milestoneMap"
        @drag-start="emit('dragStart', $event)"
        @drop-on-column="emit('dropOnColumn', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />

      <ProjectTasksBoardColumn
        :title="t('projects.tasks.statuses.inProgress')"
        status="IN_PROGRESS"
        :tasks="inProgressTasks"
        dot-class="bg-amber-500"
        :dragged-task-id="draggedTaskId"
        :milestone-map="milestoneMap"
        @drag-start="emit('dragStart', $event)"
        @drop-on-column="emit('dropOnColumn', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />

      <ProjectTasksBoardColumn
        :title="t('projects.tasks.statuses.inReview')"
        status="IN_REVIEW"
        :tasks="inReviewTasks"
        dot-class="bg-purple-500"
        :dragged-task-id="draggedTaskId"
        :milestone-map="milestoneMap"
        @drag-start="emit('dragStart', $event)"
        @drop-on-column="emit('dropOnColumn', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />

      <ProjectTasksBoardColumn
        :title="t('projects.tasks.statuses.done')"
        status="DONE"
        :tasks="doneTasks"
        dot-class="bg-emerald-500"
        :dragged-task-id="draggedTaskId"
        :milestone-map="milestoneMap"
        @drag-start="emit('dragStart', $event)"
        @drop-on-column="emit('dropOnColumn', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
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
        <span>{{
          t('projects.tasks.showMoreTasks', { current: tasksCount, total: totalCount })
        }}</span>
      </BaseButton>
    </div>
  </div>
</template>
