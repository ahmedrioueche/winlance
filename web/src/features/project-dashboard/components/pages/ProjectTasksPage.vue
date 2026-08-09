<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useTaskDeletion } from '../../composables/tasks/useTaskDeletion'
import { useTaskFilters } from '../../composables/tasks/useTaskFilters'
import { useTaskModal } from '../../composables/tasks/useTaskModal'
import { useTaskPagination } from '../../composables/tasks/useTaskPagination'
import { useTaskReordering } from '../../composables/tasks/useTaskReordering'
import { useTaskViewMode } from '../../composables/tasks/useTaskViewMode'
import ProjectTaskDeleteModal from '../tasks/ProjectTaskDeleteModal.vue'
import ProjectTaskFormModal from '../tasks/ProjectTaskFormModal.vue'
import ProjectTasksFilterBar from '../tasks/ProjectTasksFilterBar.vue'
import ProjectTasksHeader from '../tasks/ProjectTasksHeader.vue'
import ProjectTasksListTable from '../tasks/ProjectTasksListTable.vue'
import ProjectTasksBoardView from '../tasks/ProjectTasksBoardView.vue'

const route = useRoute()
const toast = useToast()
const projectId = computed(() => String(route.params.id || ''))

const { viewMode } = useTaskViewMode()

const {
  tasks,
  totalCount,
  completedCount,
  progressPercent,
  isPending,
  isError,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useTaskPagination(projectId)

const {
  searchQuery,
  priorityFilter,
  statusFilter,
  filteredTasks,
  todoTasks,
  inProgressTasks,
  inReviewTasks,
  doneTasks,
  highUrgentCount,
} = useTaskFilters(tasks)

const {
  draggedTaskId,
  draggedRowIndex,
  handleQuickStatusChange,
  handleDragStart,
  handleDropOnColumn,
  handleRowDragStart,
  handleRowDrop,
  handleMoveRow,
} = useTaskReordering(projectId, tasks, filteredTasks, (err) => toast.errorFromUnknown(err))

const {
  isModalOpen,
  editingTask,
  taskTitle,
  taskDescription,
  taskStatus,
  taskPriority,
  taskDueDate,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleSaveTask,
  isSubmitting,
} = useTaskModal(
  projectId,
  computed(() => tasks.value.length),
  (msg) => toast.success(msg),
  (err) => toast.errorFromUnknown(err),
)

const {
  isDeleteModalOpen,
  taskToDelete,
  isDeleting,
  handlePromptDeleteTask,
  handleConfirmDeleteTask,
} = useTaskDeletion(projectId)
</script>

<template>
  <section class="space-y-6">
    <Skeleton v-if="isPending" class="h-48 w-full rounded-2xl" />

    <ErrorState
      v-else-if="isError"
      title="Failed to load tasks"
      message="An error occurred while loading tasks for this project."
      @retry="refetch()"
    />

    <template v-else>
      <ProjectTasksHeader
        v-model:view-mode="viewMode"
        :total-count="totalCount"
        :tasks-count="tasks.length"
        :completed-count="completedCount"
        :progress-percent="progressPercent"
        :in-progress-count="inProgressTasks.length"
        :high-urgent-count="highUrgentCount"
        @create-task="handleOpenCreateModal"
      />

      <ProjectTasksFilterBar
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:priority-filter="priorityFilter"
      />

      <!-- List Table View -->
      <ProjectTasksListTable
        v-if="viewMode === 'list'"
        :tasks="filteredTasks"
        :total-count="totalCount"
        :dragged-row-index="draggedRowIndex"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        @status-change="handleQuickStatusChange"
        @edit="handleOpenEditModal"
        @delete="handlePromptDeleteTask"
        @drag-start="handleRowDragStart"
        @drop="handleRowDrop"
        @move-row="handleMoveRow"
        @fetch-next-page="fetchNextPage()"
      />

      <!-- Kanban Board View -->
      <ProjectTasksBoardView
        v-else
        :todo-tasks="todoTasks"
        :in-progress-tasks="inProgressTasks"
        :in-review-tasks="inReviewTasks"
        :done-tasks="doneTasks"
        :tasks-count="tasks.length"
        :total-count="totalCount"
        :dragged-task-id="draggedTaskId"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        @drag-start="handleDragStart"
        @drop-on-column="handleDropOnColumn"
        @edit="handleOpenEditModal"
        @delete="handlePromptDeleteTask"
        @fetch-next-page="fetchNextPage()"
      />
    </template>

    <!-- Create / Edit Task Modal -->
    <ProjectTaskFormModal
      v-model:task-title="taskTitle"
      v-model:task-description="taskDescription"
      v-model:task-status="taskStatus"
      v-model:task-priority="taskPriority"
      v-model:task-due-date="taskDueDate"
      :open="isModalOpen"
      :editing-task="editingTask"
      :is-submitting="isSubmitting"
      @close="isModalOpen = false"
      @save="handleSaveTask"
    />

    <!-- Delete Task Confirmation Modal -->
    <ProjectTaskDeleteModal
      :open="isDeleteModalOpen"
      :task="taskToDelete"
      :is-deleting="isDeleting"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDeleteTask"
    />
  </section>
</template>
