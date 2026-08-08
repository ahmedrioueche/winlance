<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  Kanban,
  ListFilter,
  Plus,
  Search,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useCreateRequirementMutation, useProjectQuery } from '../../queries'

const route = useRoute()
const toast = useToast()

const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const createReqMutation = useCreateRequirementMutation()

// UI State
const viewMode = ref<'list' | 'kanban'>('list')
const searchQuery = ref('')

// Modal State
const createModalOpen = ref(false)
const newTitle = ref('')
const newDescription = ref('')

const requirements = computed(() => project.value?.requirements ?? [])

const filteredRequirements = computed(() => {
  let list = requirements.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q),
    )
  }

  return list
})

async function handleCreateTaskConfirm() {
  if (!newTitle.value.trim() || !projectId.value) return
  try {
    await createReqMutation.mutateAsync({
      projectId: projectId.value,
      payload: {
        title: newTitle.value.trim(),
        description: newDescription.value.trim(),
        order: requirements.value.length + 1,
      },
    })
    createModalOpen.value = false
    newTitle.value = ''
    newDescription.value = ''
    toast.success('Task / Requirement added to project scope!')
  } catch (error) {
    toast.errorFromUnknown(error)
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

  <section v-else class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          Tasks & Scope Requirements
        </h1>
        <p class="mt-1 text-sm text-muted">
          Track deliverables, task items, and scope requirements for {{ project?.title }}
        </p>
      </div>

      <!-- Header Actions -->
      <div class="flex shrink-0 items-center gap-3">
        <!-- View Toggle -->
        <div class="flex items-center gap-1 rounded-xl border border-border bg-canvas p-1 text-xs">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="viewMode === 'list' ? 'bg-accent text-accent-contrast font-semibold shadow-xs' : 'text-muted hover:text-ink'"
            @click="viewMode = 'list'"
          >
            <ListFilter class="h-3.5 w-3.5" />
            <span>List</span>
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

        <BaseButton size="sm" @click="createModalOpen = true">
          <Plus class="h-3.5 w-3.5" />
          <span>New Task</span>
        </BaseButton>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tasks & scope..."
          class="w-full rounded-xl border border-border bg-canvas-elevated pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none shadow-xs"
        />
      </div>

      <!-- Total Count -->
      <div class="text-xs text-muted font-medium">
        Showing {{ filteredRequirements.length }} tasks
      </div>
    </div>

    <!-- ═══ LIST VIEW MODE ═══ -->
    <div v-if="viewMode === 'list'" class="space-y-3">
      <div v-if="filteredRequirements.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
        No tasks or requirements found. Click "New Task" above to add one.
      </div>

      <div
        v-for="req in filteredRequirements"
        :key="req.id"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft hover:border-accent/30 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent shrink-0 mt-0.5">
            <CheckCircle2 class="h-4 w-4" />
          </div>
          <div>
            <h3 class="font-bold text-ink text-sm">{{ req.title }}</h3>
            <p v-if="req.description" class="text-xs text-muted mt-1 leading-relaxed">
              {{ req.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span class="rounded-full bg-canvas-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted uppercase">
            {{ req.created_by_role }}
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ KANBAN BOARD VIEW MODE ═══ -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Backlog / To Do Column -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-border/60 pb-3">
          <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
            <Clock class="h-4 w-4 text-accent" />
            To Do
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">
            {{ filteredRequirements.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="req in filteredRequirements"
            :key="req.id"
            class="rounded-xl border border-border bg-canvas p-4 text-xs space-y-2 shadow-xs"
          >
            <h4 class="font-bold text-ink">{{ req.title }}</h4>
            <p v-if="req.description" class="text-muted text-[11px] leading-relaxed">
              {{ req.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted">
              <span class="uppercase font-semibold">{{ req.created_by_role }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-border/60 pb-3">
          <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
            <Clock class="h-4 w-4 text-amber-500" />
            In Progress
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">0</span>
        </div>
        <div class="text-xs text-muted text-center py-8 border border-dashed border-border rounded-xl">
          Drag tasks here
        </div>
      </div>

      <!-- Completed Column -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-border/60 pb-3">
          <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 text-emerald-500" />
            Done
          </span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-bold text-muted">0</span>
        </div>
        <div class="text-xs text-muted text-center py-8 border border-dashed border-border rounded-xl">
          Completed deliverables
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <BaseModal
      :open="createModalOpen"
      title="Add New Project Task"
      @close="createModalOpen = false"
    >
      <div class="space-y-4 text-xs">
        <BaseInput
          v-model="newTitle"
          label="Task Title"
          placeholder="e.g. Design Token Specification..."
          required
        />

        <div class="space-y-1">
          <label class="font-medium text-ink">Description / Scope Details</label>
          <textarea
            v-model="newDescription"
            rows="3"
            class="w-full rounded-xl border border-border bg-canvas p-3 font-mono text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
            placeholder="Detailed task description..."
          />
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="createModalOpen = false">
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          :loading="createReqMutation.isPending.value"
          @click="handleCreateTaskConfirm"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Create Task</span>
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
