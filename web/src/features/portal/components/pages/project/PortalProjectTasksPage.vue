<script setup lang="ts">
import {
  Calendar,
  CheckCheck,
  CheckSquare,
  Eye,
  Kanban,
  ListFilter,
  Loader2,
  Search,
  X,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BasePageHeader,
  BaseSelect,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

import type { PortalTask } from '../../../types'
import { useApprovePortalTaskMutation, usePortalProjectQuery } from '../../../queries'
import { useToast } from '@/shared/toast/useToast'

const { t, d } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)
const approveMutation = useApprovePortalTaskMutation()
const toast = useToast()

const milestones = computed(() => project.value?.progress?.milestones || (project.value as any)?.milestones || [])
const milestoneMap = computed(() => new Map(milestones.value.map((m: any) => [m.id, m.title])))

// Controls state
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const viewMode = ref<'list' | 'kanban'>('list')
const selectedTask = ref<PortalTask | null>(null)
const approvingTaskId = ref<string | null>(null)
const draggedTaskId = ref<string | null>(null)
const dragOverColumn = ref<string | null>(null)

const tasks = computed<PortalTask[]>(() => project.value?.tasks || [])

// Task Metrics
const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter((tk) => tk.status === 'DONE').length)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})
const inProgressCount = computed(() => tasks.value.filter((tk) => tk.status === 'IN_PROGRESS' || tk.status === 'IN_REVIEW').length)
const highUrgentCount = computed(() => tasks.value.filter((tk) => tk.priority === 'HIGH' || tk.priority === 'URGENT').length)

// Filtered Tasks List
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesSearch =
      !searchQuery.value ||
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesStatus = !statusFilter.value || task.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

const tasksCount = computed(() => filteredTasks.value.length)

// Filter options — matches freelancer filter bar exactly
const filterStatusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.tasks.allStatuses', 'All Statuses') },
  { value: 'TODO', label: t('projects.tasks.statuses.todo', 'To Do') },
  { value: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress', 'In Progress') },
  { value: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview', 'In Review') },
  { value: 'DONE', label: t('projects.tasks.statuses.done', 'Done') },
])

const filterPriorityOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.tasks.allPriorities', 'All Priorities') },
  { value: 'LOW', label: t('projects.tasks.priorities.low', 'Low') },
  { value: 'MEDIUM', label: t('projects.tasks.priorities.medium', 'Medium') },
  { value: 'HIGH', label: t('projects.tasks.priorities.high', 'High') },
  { value: 'URGENT', label: t('projects.tasks.priorities.urgent', 'Urgent') },
])

// Kanban Columns
const kanbanColumns = [
  { key: 'TODO', label: t('projects.tasks.statuses.todo', 'To Do'), badgeClass: 'bg-canvas-muted text-muted border-border' },
  { key: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress', 'In Progress'), badgeClass: 'bg-accent/15 text-accent border-accent/30' },
  { key: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview', 'In Review'), badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { key: 'DONE', label: t('projects.tasks.statuses.done', 'Done'), badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
]

function getTasksForColumn(colKey: string) {
  return filteredTasks.value.filter((tk) => tk.status === colKey)
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A'
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'IN_PROGRESS':
      return 'bg-accent/15 text-accent border-accent/30'
    case 'IN_REVIEW':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'TODO':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
}

function getPriorityBadgeClass(priority?: string) {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-bold'
    case 'HIGH':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold'
    case 'MEDIUM':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'LOW':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
}

function openTaskDetail(task: PortalTask) {
  selectedTask.value = task
}

function closeTaskDetail() {
  selectedTask.value = null
}

function handleDragStart(task: PortalTask) {
  // Only IN_REVIEW tasks can be dragged
  if (task.status !== 'IN_REVIEW') return
  draggedTaskId.value = task.id
}

function handleDragEnd() {
  draggedTaskId.value = null
  dragOverColumn.value = null
}

function handleDragOverColumn(colKey: string) {
  // Only highlight DONE column as a valid drop target
  if (colKey === 'DONE' && draggedTaskId.value) {
    dragOverColumn.value = colKey
  }
}

function handleDragLeaveColumn() {
  dragOverColumn.value = null
}

function handleDropOnColumn(colKey: string) {
  dragOverColumn.value = null
  if (colKey !== 'DONE' || !draggedTaskId.value) {
    draggedTaskId.value = null
    return
  }
  const task = tasks.value.find((t) => t.id === draggedTaskId.value)
  draggedTaskId.value = null
  if (task && task.status === 'IN_REVIEW') {
    handleApproveTask(task)
  }
}

async function handleApproveTask(task: PortalTask) {
  approvingTaskId.value = task.id
  try {
    await approveMutation.mutateAsync({
      token: token.value,
      projectId: projectId.value,
      taskId: task.id,
    })
    toast.success('projects.tasks.statusUpdatedToast', { status: 'Done' })
    closeTaskDetail()
  } catch (err) {
    toast.errorFromUnknown(err)
  } finally {
    approvingTaskId.value = null
  }
}
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-32 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load tasks')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load project tasks.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <!-- Header Card — mirrors ProjectTasksHeader.vue exactly -->
    <BasePageHeader :title="t('projects.tasks.title', 'Tasks & Scope Requirements')">
      <template #badge>
        <span class="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
          Read Only
        </span>
      </template>

      <template #subtitle>
        <div class="flex flex-wrap items-center gap-3 text-xs font-medium text-muted">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-accent" />
            <span class="font-semibold text-ink">
              {{ t('projects.tasks.totalTasks', { count: totalCount }, `Total Tasks: ${totalCount}`) }}
            </span>
          </span>
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 font-medium text-accent">
            <span>{{ t('projects.tasks.showingTasks', { count: tasksCount }, `Showing ${tasksCount} Tasks`) }}</span>
          </span>
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            <strong>{{ t('projects.tasks.doneStatus', { count: completedCount, percent: progressPercent }, `${completedCount} Done (${progressPercent}%)`) }}</strong>
          </span>
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span class="h-2 w-2 rounded-full bg-amber-500" />
            <strong>{{ t('projects.tasks.inProgressStatus', { count: inProgressCount }, `${inProgressCount} In Progress`) }}</strong>
          </span>
          <template v-if="highUrgentCount > 0">
            <span class="text-border">|</span>
            <span class="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span class="h-2 w-2 rounded-full bg-red-500" />
              <strong>{{ t('projects.tasks.highUrgentStatus', { count: highUrgentCount }, `${highUrgentCount} High / Urgent`) }}</strong>
            </span>
          </template>
        </div>
      </template>

      <template #actions>
        <!-- View Toggle (List Table vs Kanban Board) — matches freelancer exactly -->
        <div class="flex items-center gap-1 rounded-xl border border-border bg-canvas p-1 text-xs">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="viewMode === 'list' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
            @click="viewMode = 'list'"
          >
            <ListFilter class="h-3.5 w-3.5" />
            <span>{{ t('projects.tasks.listTable', 'List Table') }}</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="viewMode === 'kanban' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
            @click="viewMode = 'kanban'"
          >
            <Kanban class="h-3.5 w-3.5" />
            <span>{{ t('projects.tasks.board', 'Board') }}</span>
          </button>
        </div>
        <!-- No "New Task" button — client has read-only access -->
      </template>
    </BasePageHeader>

    <!-- Filter Bar — mirrors ProjectTasksFilterBar.vue exactly -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('projects.tasks.searchPlaceholder', 'Search task title or description...')"
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

    <!-- Empty State -->
    <EmptyState
      v-if="filteredTasks.length === 0"
      :title="'No Tasks Found'"
      :description="t('projects.tasks.noTasksFound', 'No tasks found. No tasks have been assigned to this project yet.')"
    />

    <!-- LIST TABLE VIEW -->
    <div
      v-else-if="viewMode === 'list'"
      class="overflow-hidden rounded-2xl border border-border bg-canvas-elevated shadow-soft"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-start text-xs">
          <thead class="border-b border-border bg-canvas-muted/50 font-semibold text-muted uppercase tracking-wider">
            <tr>
              <th class="p-4 text-start">{{ t('projects.tasks.tableHeaders.taskTitle', 'Task / Deliverable Title') }}</th>
              <th class="p-4 text-start">{{ t('projects.tasks.tableHeaders.status', 'Status') }}</th>
              <th class="p-4 text-start">{{ t('projects.tasks.tableHeaders.priority', 'Priority') }}</th>
              <th class="p-4 text-start">{{ t('projects.tasks.tableHeaders.dueDate', 'Target Due Date') }}</th>
              <th class="p-4 text-end">{{ t('projects.tasks.tableHeaders.actions', 'Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60 text-ink">
            <tr
              v-for="task in filteredTasks"
              :key="task.id"
              class="transition hover:bg-canvas-muted/40 cursor-pointer"
              @click="openTaskDetail(task)"
            >
              <!-- Task Title & Description -->
              <td class="p-4 font-medium max-w-xs">
                <div class="flex items-start gap-2.5">
                  <CheckSquare class="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-semibold text-ink block leading-snug">
                        {{ task.title }}
                      </span>
                      <span v-if="milestoneMap.get((task as any).milestone || (task as any).milestone_id || '')" class="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        <Sparkles class="h-3 w-3" />
                        <span>{{ milestoneMap.get((task as any).milestone || (task as any).milestone_id || '') }}</span>
                      </span>
                    </div>
                    <span v-if="task.description" class="text-[11px] text-muted truncate block max-w-sm mt-0.5">
                      {{ task.description }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td class="p-4">
                <span
                  class="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider inline-block"
                  :class="getStatusBadgeClass(task.status)"
                >
                  {{ task.status.replace('_', ' ') }}
                </span>
              </td>

              <!-- Priority -->
              <td class="p-4">
                <span
                  class="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider inline-block"
                  :class="getPriorityBadgeClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
              </td>

              <!-- Due Date -->
              <td class="p-4 text-muted">
                {{ formatDate(task.due_date) }}
              </td>

              <!-- Action Buttons -->
              <td class="p-4 text-end" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <BaseButton
                    v-if="task.status === 'IN_REVIEW'"
                    size="sm"
                    :disabled="approvingTaskId === task.id"
                    @click="handleApproveTask(task)"
                  >
                    <Loader2 v-if="approvingTaskId === task.id" class="h-3.5 w-3.5 animate-spin" />
                    <CheckCheck v-else class="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </BaseButton>
                  <BaseButton variant="secondary" size="sm" @click="openTaskDetail(task)">
                    <Eye class="h-3.5 w-3.5" />
                    <span>View</span>
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- KANBAN BOARD VIEW -->
    <div
      v-else-if="viewMode === 'kanban'"
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      <div
        v-for="col in kanbanColumns"
        :key="col.key"
        class="flex flex-col rounded-2xl border p-4 shadow-soft min-h-[350px] transition-colors"
        :class="[
          dragOverColumn === col.key && col.key === 'DONE'
            ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
            : 'border-border bg-canvas-elevated',
        ]"
        @dragover.prevent="handleDragOverColumn(col.key)"
        @dragleave="handleDragLeaveColumn"
        @drop.prevent="handleDropOnColumn(col.key)"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <span
            class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase"
            :class="col.badgeClass"
          >
            {{ col.label }}
          </span>
          <span class="text-xs font-bold text-muted">
            {{ getTasksForColumn(col.key).length }}
          </span>
        </div>

        <!-- Drop hint for DONE column -->
        <div
          v-if="dragOverColumn === 'DONE' && col.key === 'DONE' && draggedTaskId"
          class="mb-3 flex items-center gap-2 rounded-xl border border-dashed border-accent bg-accent/10 p-3 text-xs font-medium text-accent"
        >
          <CheckCheck class="h-4 w-4 shrink-0" />
          <span>Drop here to approve &amp; mark as Done</span>
        </div>

        <!-- Column Cards List -->
        <div class="flex-1 space-y-3">
          <div
            v-for="task in getTasksForColumn(col.key)"
            :key="task.id"
            :draggable="task.status === 'IN_REVIEW'"
            class="rounded-xl border border-border bg-canvas p-4 shadow-xs hover:border-accent/40 transition space-y-2.5"
            :class="[
              task.status === 'IN_REVIEW' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
              draggedTaskId === task.id ? 'opacity-40 border-accent border-dashed' : '',
              approvingTaskId === task.id ? 'opacity-60 pointer-events-none' : '',
            ]"
            @dragstart="handleDragStart(task)"
            @dragend="handleDragEnd"
            @click="openTaskDetail(task)"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-semibold text-xs text-ink leading-snug">
                {{ task.title }}
              </h4>
              <span
                class="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider shrink-0"
                :class="getPriorityBadgeClass(task.priority)"
              >
                {{ task.priority }}
              </span>
            </div>

            <div v-if="milestoneMap.get((task as any).milestone || (task as any).milestone_id || '')" class="mt-1">
              <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 max-w-full truncate">
                <Sparkles class="h-2.5 w-2.5 shrink-0" />
                <span class="truncate">{{ milestoneMap.get((task as any).milestone || (task as any).milestone_id || '') }}</span>
              </span>
            </div>

            <p v-if="task.description" class="text-[11px] text-muted line-clamp-2">
              {{ task.description }}
            </p>

            <div class="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
              <div v-if="task.due_date" class="flex items-center gap-1.5 text-[10px] text-muted">
                <Calendar class="h-3 w-3 text-accent shrink-0" />
                <span>Due: {{ formatDate(task.due_date) }}</span>
              </div>

              <!-- Inline approve button on IN_REVIEW cards -->
              <button
                v-if="task.status === 'IN_REVIEW'"
                type="button"
                class="ml-auto flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent hover:bg-accent/20 transition"
                :disabled="approvingTaskId === task.id"
                @click.stop="handleApproveTask(task)"
              >
                <Loader2 v-if="approvingTaskId === task.id" class="h-3 w-3 animate-spin" />
                <CheckCheck v-else class="h-3 w-3" />
                <span>Approve</span>
              </button>
            </div>
          </div>

          <div
            v-if="getTasksForColumn(col.key).length === 0"
            class="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/60 text-center text-xs text-muted/60"
          >
            No tasks
          </div>
        </div>
      </div>
    </div>

    <!-- READ-ONLY TASK DETAIL MODAL -->
    <div
      v-if="selectedTask"
      class="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm p-4"
      @click.self="closeTaskDetail"
    >
      <div class="w-full max-w-lg rounded-2xl border border-border bg-canvas-elevated p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span
                class="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                :class="getStatusBadgeClass(selectedTask.status)"
              >
                {{ selectedTask.status.replace('_', ' ') }}
              </span>
              <span
                class="rounded-full border px-2.5 py-0.5 text-[10px] uppercase"
                :class="getPriorityBadgeClass(selectedTask.priority)"
              >
                {{ selectedTask.priority }} Priority
              </span>
            </div>
            <h3 class="font-display text-lg font-bold text-ink">
              {{ selectedTask.title }}
            </h3>
          </div>

          <button
            type="button"
            class="rounded-lg p-1 text-muted hover:bg-canvas-muted hover:text-ink transition"
            @click="closeTaskDetail"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Task Description -->
        <div class="space-y-1.5">
          <h4 class="text-xs font-semibold text-muted">Description</h4>
          <div class="rounded-xl border border-border/60 bg-canvas p-4 text-xs text-ink-soft leading-relaxed whitespace-pre-line">
            {{ selectedTask.description || 'No description provided for this task.' }}
          </div>
        </div>

        <!-- Task Info Meta Grid -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="rounded-xl border border-border/60 bg-canvas p-3">
            <span class="text-muted block text-[11px]">Due Date</span>
            <span class="font-semibold text-ink mt-0.5 block">
              {{ formatDate(selectedTask.due_date) }}
            </span>
          </div>
          <div class="rounded-xl border border-border/60 bg-canvas p-3">
            <span class="text-muted block text-[11px]">Created Date</span>
            <span class="font-semibold text-ink mt-0.5 block">
              {{ formatDate(selectedTask.created_at) }}
            </span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <BaseButton variant="secondary" size="md" @click="closeTaskDetail">
            Close
          </BaseButton>
          <BaseButton
            v-if="selectedTask.status === 'IN_REVIEW'"
            size="md"
            :disabled="approvingTaskId === selectedTask.id"
            @click="handleApproveTask(selectedTask)"
          >
            <Loader2 v-if="approvingTaskId === selectedTask.id" class="h-4 w-4 animate-spin" />
            <CheckCheck v-else class="h-4 w-4" />
            <span>Approve &amp; Mark Done</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
