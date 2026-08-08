<script setup lang="ts">
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  GripVertical,
  Kanban,
  ListFilter,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  BaseTextarea,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useProjectQuery,
  useProjectTasksQuery,
  useReorderTasksMutation,
  useUpdateTaskMutation,
} from '../../queries'
import type { ProjectTask, TaskPriority, TaskStatus } from '../../types'

const route = useRoute()
const toast = useToast()

const projectId = computed(() => String(route.params.id || ''))
const { data: project } = useProjectQuery(projectId)
const { data: tasksData, isPending, isError, refetch } = useProjectTasksQuery(projectId)

const createTaskMutation = useCreateTaskMutation()
const updateTaskMutation = useUpdateTaskMutation()
const deleteTaskMutation = useDeleteTaskMutation()
const reorderTasksMutation = useReorderTasksMutation()

// UI State & localStorage Persistence
const VIEW_MODE_STORAGE_KEY = 'winlance_project_tasks_view_mode'
const getInitialViewMode = (): 'list' | 'kanban' => {
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (saved === 'kanban' || saved === 'list') return saved
  } catch {
    // Ignore storage errors if disabled in browser
  }
  return 'list'
}

const viewMode = ref<'list' | 'kanban'>(getInitialViewMode())

watch(viewMode, (newMode) => {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode)
  } catch {
    // Ignore storage errors
  }
})
const searchQuery = ref('')
const priorityFilter = ref<string>('')
const statusFilter = ref<string>('')

// Modal State (Create & Edit)
const isModalOpen = ref(false)
const editingTask = ref<ProjectTask | null>(null)
const taskTitle = ref('')
const taskDescription = ref('')
const taskStatus = ref<TaskStatus>('TODO')
const taskPriority = ref<TaskPriority>('MEDIUM')
const taskDueDate = ref('')

// Drag and Drop state (Kanban & Table row reordering)
const draggedTaskId = ref<string | null>(null)
const draggedRowIndex = ref<number | null>(null)

const tasks = computed<ProjectTask[]>(() => {
  if (tasksData.value && Array.isArray(tasksData.value)) {
    return tasksData.value
  }
  return project.value?.tasks ?? []
})

const priorityOptions: SelectOption[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

const statusOptions: SelectOption[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
]

const filterStatusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  ...statusOptions,
]

const filterPriorityOptions: SelectOption[] = [
  { value: '', label: 'All Priorities' },
  ...priorityOptions,
]

const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)

    const matchesStatus = !statusFilter.value || t.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || t.priority === priorityFilter.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

// Kanban Columns
const todoTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'TODO'))
const inProgressTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'IN_PROGRESS'))
const inReviewTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'IN_REVIEW'))
const doneTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'DONE'))

// Task Stats
const completedCount = computed(() => tasks.value.filter((t) => t.status === 'DONE').length)
const progressPercent = computed(() => {
  if (!tasks.value.length) return 0
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

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

function getStatusBadgeClass(status?: TaskStatus | string) {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'IN_REVIEW':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case 'IN_PROGRESS':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'TODO':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
}

// ─── Table Row Reordering Handlers ───
function handleRowDragStart(index: number) {
  draggedRowIndex.value = index
}

async function handleRowDrop(targetIndex: number) {
  if (draggedRowIndex.value === null || draggedRowIndex.value === targetIndex || !projectId.value) return
  const currentList = [...filteredTasks.value]
  const [draggedItem] = currentList.splice(draggedRowIndex.value, 1)
  currentList.splice(targetIndex, 0, draggedItem)
  draggedRowIndex.value = null

  try {
    await reorderTasksMutation.mutateAsync({
      projectId: projectId.value,
      orders: currentList.map((t) => t.id),
    })
    toast.success('Tasks order updated!')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleMoveRow(index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= filteredTasks.value.length || !projectId.value) return

  const currentList = [...filteredTasks.value]
  const [movedItem] = currentList.splice(index, 1)
  currentList.splice(targetIndex, 0, movedItem)

  try {
    await reorderTasksMutation.mutateAsync({
      projectId: projectId.value,
      orders: currentList.map((t) => t.id),
    })
    toast.success('Tasks order updated!')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

// ─── Modal Actions ───
function handleOpenCreateModal() {
  editingTask.value = null
  taskTitle.value = ''
  taskDescription.value = ''
  taskStatus.value = 'TODO'
  taskPriority.value = 'MEDIUM'
  taskDueDate.value = ''
  isModalOpen.value = true
}

function handleOpenEditModal(task: ProjectTask) {
  editingTask.value = task
  taskTitle.value = task.title
  taskDescription.value = task.description || ''
  taskStatus.value = task.status || 'TODO'
  taskPriority.value = task.priority || 'MEDIUM'
  taskDueDate.value = task.due_date || ''
  isModalOpen.value = true
}

async function handleSaveTask() {
  if (!taskTitle.value.trim() || !projectId.value) return

  try {
    if (editingTask.value) {
      await updateTaskMutation.mutateAsync({
        projectId: projectId.value,
        taskId: editingTask.value.id,
        payload: {
          title: taskTitle.value.trim(),
          description: taskDescription.value.trim(),
          status: taskStatus.value,
          priority: taskPriority.value,
          due_date: taskDueDate.value || null,
        },
      })
      toast.success('Task updated successfully!')
    } else {
      await createTaskMutation.mutateAsync({
        projectId: projectId.value,
        payload: {
          title: taskTitle.value.trim(),
          description: taskDescription.value.trim(),
          status: taskStatus.value,
          priority: taskPriority.value,
          due_date: taskDueDate.value || null,
          order: tasks.value.length + 1,
        },
      })
      toast.success('Task created successfully!')
    }

    isModalOpen.value = false
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleQuickStatusChange(task: ProjectTask, newStatus: TaskStatus) {
  if (!projectId.value || task.status === newStatus) return
  try {
    await updateTaskMutation.mutateAsync({
      projectId: projectId.value,
      taskId: task.id,
      payload: { status: newStatus },
    })
    toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`)
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleDeleteTask(taskId: string) {
  if (!projectId.value) return
  try {
    await deleteTaskMutation.mutateAsync({ projectId: projectId.value, taskId })
    toast.success('Task deleted.')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

// ─── Drag and Drop Handlers for Kanban Board ───
function handleDragStart(taskId: string) {
  draggedTaskId.value = taskId
}

async function handleDropOnColumn(targetStatus: TaskStatus) {
  if (!draggedTaskId.value || !projectId.value) return
  const task = tasks.value.find((t) => t.id === draggedTaskId.value)
  draggedTaskId.value = null

  if (task && task.status !== targetStatus) {
    await handleQuickStatusChange(task, targetStatus)
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-[600px] w-full rounded-2xl" />
  </div>

  <!-- Error State -->
  <ErrorState
    v-else-if="isError"
    title="Failed to load project tasks"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-4">
    <!-- Compact Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-display text-xl font-bold tracking-tight text-ink">
            Tasks
          </h1>
          <span
            v-if="project?.proposal || tasks.some(t => t.source_proposal)"
            class="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400"
            title="Generated automatically from proposal deliverables via Gemini AI"
          >
            <Sparkles class="h-3 w-3" />
            AI Parsed
          </span>
        </div>

        <!-- Inline Compact Stats Summary -->
        <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
          <span class="inline-flex items-center gap-1.5 text-muted">
            <span class="h-2 w-2 rounded-full bg-accent" />
            <strong class="text-ink font-semibold">{{ tasks.length }}</strong> Total Tasks
          </span>
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            <strong>{{ completedCount }}</strong> Done ({{ progressPercent }}%)
          </span>
          <span class="text-border">|</span>
          <span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span class="h-2 w-2 rounded-full bg-amber-500" />
            <strong>{{ inProgressTasks.length }}</strong> In Progress
          </span>
          <span v-if="tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length > 0" class="text-border">|</span>
          <span
            v-if="tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length > 0"
            class="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400"
          >
            <span class="h-2 w-2 rounded-full bg-red-500" />
            <strong>{{ tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length }}</strong> High / Urgent
          </span>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="flex shrink-0 items-center gap-3">
        <!-- View Toggle (List Table vs Kanban Board) -->
        <div class="flex items-center gap-1 rounded-xl border border-border bg-canvas p-1 text-xs">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="viewMode === 'list' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
            @click="viewMode = 'list'"
          >
            <ListFilter class="h-3.5 w-3.5" />
            <span>List Table</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="viewMode === 'kanban' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
            @click="viewMode = 'kanban'"
          >
            <Kanban class="h-3.5 w-3.5" />
            <span>Board</span>
          </button>
        </div>

        <BaseButton size="sm" @click="handleOpenCreateModal">
          <Plus class="h-3.5 w-3.5" />
          <span>New Task</span>
        </BaseButton>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search task title or description..."
          class="w-full rounded-xl border border-border bg-canvas-elevated pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none shadow-xs"
        />
      </div>

      <div class="flex items-center gap-2 shrink-0">
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

    <!-- ═══ LIST VIEW MODE (Jira-style Table with Drag & Drop Reordering) ═══ -->
    <div v-if="viewMode === 'list'" class="overflow-x-auto rounded-2xl border border-border bg-canvas-elevated shadow-soft">
      <div v-if="filteredTasks.length === 0" class="p-12 text-center text-xs text-muted">
        No tasks found. Click "New Task" above to add one.
      </div>

      <table v-else class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-border bg-canvas-muted text-[11px] font-semibold uppercase tracking-wider text-muted select-none">
            <th class="w-10 px-3 py-3 text-center">#</th>
            <th class="w-14 px-2 py-3 text-center">Order</th>
            <th class="px-4 py-3">Task Title & Description</th>
            <th class="w-36 px-4 py-3">Status</th>
            <th class="w-28 px-4 py-3">Priority</th>
            <th class="w-32 px-4 py-3">Due Date</th>
            <th class="w-24 px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/60">
          <tr
            v-for="(task, index) in filteredTasks"
            :key="task.id"
            draggable="true"
            class="group hover:bg-canvas-muted/60 transition-colors"
            :class="{ 'opacity-50 bg-canvas-muted': draggedRowIndex === index }"
            @dragstart="handleRowDragStart(index)"
            @dragover.prevent
            @drop="handleRowDrop(index)"
          >
            <!-- Drag Handle -->
            <td class="px-3 py-3.5 text-center text-muted">
              <div class="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted/60 hover:text-ink" title="Drag to reorder">
                <GripVertical class="h-4 w-4" />
              </div>
            </td>

            <!-- Up / Down Order buttons -->
            <td class="px-2 py-3.5 text-center">
              <div class="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  class="p-0.5 text-muted hover:text-ink disabled:opacity-30"
                  :disabled="index === 0"
                  title="Move Up"
                  @click="handleMoveRow(index, 'up')"
                >
                  <ChevronUp class="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  class="p-0.5 text-muted hover:text-ink disabled:opacity-30"
                  :disabled="index === filteredTasks.length - 1"
                  title="Move Down"
                  @click="handleMoveRow(index, 'down')"
                >
                  <ChevronDown class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>

            <!-- Task Title & Description -->
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 v-if="task.status === 'DONE'" class="h-4 w-4 text-emerald-500 shrink-0" />
                <Clock v-else-if="task.status === 'IN_PROGRESS'" class="h-4 w-4 text-amber-500 shrink-0" />
                <span v-else class="h-2 w-2 rounded-full bg-accent shrink-0" />

                <div class="min-w-0">
                  <div class="font-bold text-ink text-xs truncate" :class="{ 'line-through text-muted': task.status === 'DONE' }">
                    {{ task.title }}
                  </div>
                  <p v-if="task.description" class="text-[11px] text-muted truncate mt-0.5 max-w-lg">
                    {{ task.description }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Quick Status Select -->
            <td class="px-4 py-3.5">
              <select
                :value="task.status"
                class="rounded-lg border px-2 py-1 text-[11px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                :class="getStatusBadgeClass(task.status)"
                @change="handleQuickStatusChange(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </td>

            <!-- Priority -->
            <td class="px-4 py-3.5">
              <span
                class="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
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
                  title="Edit Task"
                  @click="handleOpenEditModal(task)"
                >
                  <Edit3 class="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  class="p-1 text-muted hover:text-red-500 transition-colors"
                  title="Delete Task"
                  @click="handleDeleteTask(task.id)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ KANBAN BOARD VIEW MODE ═══ -->
    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- TO DO COLUMN -->
      <div
        class="rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-3 min-h-[500px]"
        @dragover.prevent
        @drop="handleDropOnColumn('TODO')"
      >
        <div class="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span class="font-display text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
            <Clock class="h-3.5 w-3.5 text-accent" />
            To Do
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">
            {{ todoTasks.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in todoTasks"
            :key="task.id"
            draggable="true"
            class="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-canvas p-3.5 text-xs space-y-2 shadow-xs hover:border-accent/40 transition-all"
            @dragstart="handleDragStart(task.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-ink line-clamp-2">{{ task.title }}</h4>
              <button class="text-muted hover:text-ink shrink-0" @click="handleOpenEditModal(task)">
                <Edit3 class="h-3.5 w-3.5" />
              </button>
            </div>
            <p v-if="task.description" class="text-muted text-[11px] leading-relaxed line-clamp-2">
              {{ task.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
              <span class="rounded-full border px-2 py-0.5 font-bold uppercase" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priority }}
              </span>
              <span v-if="task.due_date" class="text-muted">{{ task.due_date }}</span>
            </div>
          </div>

          <div v-if="todoTasks.length === 0" class="py-8 text-center text-xs text-muted/60 border border-dashed border-border/60 rounded-xl">
            Drop tasks here
          </div>
        </div>
      </div>

      <!-- IN PROGRESS COLUMN -->
      <div
        class="rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-3 min-h-[500px]"
        @dragover.prevent
        @drop="handleDropOnColumn('IN_PROGRESS')"
      >
        <div class="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span class="font-display text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
            <Clock class="h-3.5 w-3.5 text-amber-500" />
            In Progress
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">
            {{ inProgressTasks.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in inProgressTasks"
            :key="task.id"
            draggable="true"
            class="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-canvas p-3.5 text-xs space-y-2 shadow-xs hover:border-amber-500/40 transition-all"
            @dragstart="handleDragStart(task.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-ink line-clamp-2">{{ task.title }}</h4>
              <button class="text-muted hover:text-ink shrink-0" @click="handleOpenEditModal(task)">
                <Edit3 class="h-3.5 w-3.5" />
              </button>
            </div>
            <p v-if="task.description" class="text-muted text-[11px] leading-relaxed line-clamp-2">
              {{ task.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
              <span class="rounded-full border px-2 py-0.5 font-bold uppercase" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priority }}
              </span>
              <span v-if="task.due_date" class="text-muted">{{ task.due_date }}</span>
            </div>
          </div>

          <div v-if="inProgressTasks.length === 0" class="py-8 text-center text-xs text-muted/60 border border-dashed border-border/60 rounded-xl">
            Drop tasks here
          </div>
        </div>
      </div>

      <!-- IN REVIEW COLUMN -->
      <div
        class="rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-3 min-h-[500px]"
        @dragover.prevent
        @drop="handleDropOnColumn('IN_REVIEW')"
      >
        <div class="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span class="font-display text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles class="h-3.5 w-3.5 text-purple-500" />
            In Review
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">
            {{ inReviewTasks.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in inReviewTasks"
            :key="task.id"
            draggable="true"
            class="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-canvas p-3.5 text-xs space-y-2 shadow-xs hover:border-purple-500/40 transition-all"
            @dragstart="handleDragStart(task.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-ink line-clamp-2">{{ task.title }}</h4>
              <button class="text-muted hover:text-ink shrink-0" @click="handleOpenEditModal(task)">
                <Edit3 class="h-3.5 w-3.5" />
              </button>
            </div>
            <p v-if="task.description" class="text-muted text-[11px] leading-relaxed line-clamp-2">
              {{ task.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
              <span class="rounded-full border px-2 py-0.5 font-bold uppercase" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priority }}
              </span>
              <span v-if="task.due_date" class="text-muted">{{ task.due_date }}</span>
            </div>
          </div>

          <div v-if="inReviewTasks.length === 0" class="py-8 text-center text-xs text-muted/60 border border-dashed border-border/60 rounded-xl">
            Drop tasks here
          </div>
        </div>
      </div>

      <!-- DONE COLUMN -->
      <div
        class="rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-3 min-h-[500px]"
        @dragover.prevent
        @drop="handleDropOnColumn('DONE')"
      >
        <div class="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span class="font-display text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
            Done
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">
            {{ doneTasks.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in doneTasks"
            :key="task.id"
            draggable="true"
            class="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-canvas p-3.5 text-xs space-y-2 shadow-xs hover:border-emerald-500/40 transition-all opacity-85"
            @dragstart="handleDragStart(task.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-ink line-through line-clamp-2">{{ task.title }}</h4>
              <button class="text-muted hover:text-ink shrink-0" @click="handleOpenEditModal(task)">
                <Edit3 class="h-3.5 w-3.5" />
              </button>
            </div>
            <p v-if="task.description" class="text-muted text-[11px] leading-relaxed line-clamp-2">
              {{ task.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
              <span class="rounded-full border px-2 py-0.5 font-bold uppercase bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                Completed
              </span>
              <span v-if="task.due_date" class="text-muted">{{ task.due_date }}</span>
            </div>
          </div>

          <div v-if="doneTasks.length === 0" class="py-8 text-center text-xs text-muted/60 border border-dashed border-border/60 rounded-xl">
            Completed tasks here
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CREATE / EDIT TASK MODAL ═══ -->
    <BaseModal
      :open="isModalOpen"
      :title="editingTask ? 'Edit Task' : 'Add New Task'"
      @close="isModalOpen = false"
    >
      <div class="space-y-4 text-xs">
        <BaseInput
          v-model="taskTitle"
          label="Task Title"
          placeholder="e.g. Implement Stripe Webhook Handlers"
          required
        />

        <BaseTextarea
          v-model="taskDescription"
          label="Task Description / Scope Details"
          placeholder="Detailed task specifications and requirements..."
          :rows="3"
        />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BaseSelect
            v-model="taskStatus"
            label="Status"
            :options="statusOptions"
          />

          <BaseSelect
            v-model="taskPriority"
            label="Priority"
            :options="priorityOptions"
          />

          <BaseInput
            v-model="taskDueDate"
            type="date"
            label="Target Due Date"
          />
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="isModalOpen = false">
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          :loading="createTaskMutation.isPending.value || updateTaskMutation.isPending.value"
          @click="handleSaveTask"
        >
          <Plus v-if="!editingTask" class="h-3.5 w-3.5" />
          <Edit3 v-else class="h-3.5 w-3.5" />
          <span>{{ editingTask ? 'Save Changes' : 'Create Task' }}</span>
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
