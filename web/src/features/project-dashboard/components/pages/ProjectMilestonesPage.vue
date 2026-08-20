<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { FolderKanban, Plus } from 'lucide-vue-next'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BasePageHeader,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreateMilestoneMutation,
  useProjectQuery,
  useUpdateMilestoneMutation,
} from '../../queries'
import type { ProjectMilestone } from '../../types'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const createMilestoneMutation = useCreateMilestoneMutation()
const updateMilestoneMutation = useUpdateMilestoneMutation()

const milestones = computed<ProjectMilestone[]>(() => project.value?.milestones ?? [])

// Modal State
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingMilestoneId = ref('')

const title = ref('')
const description = ref('')
const dueDate = ref('')
const status = ref<string>('PENDING')
const progressPercent = ref<number>(0)

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'READY_FOR_SIGNOFF', label: 'Ready for Sign-off' },
  { value: 'DONE', label: 'Done' },
  { value: 'BLOCKED', label: 'Blocked' },
]

function resetForm() {
  title.value = ''
  description.value = ''
  dueDate.value = ''
  status.value = 'PENDING'
  progressPercent.value = 0
  editingMilestoneId.value = ''
  isEditing.value = false
}

function handleOpenCreateModal() {
  resetForm()
  isModalOpen.value = true
}

function handleOpenEditModal(ms: ProjectMilestone) {
  resetForm()
  isEditing.value = true
  editingMilestoneId.value = ms.id
  title.value = ms.title || ''
  description.value = ms.description || ''
  dueDate.value = ms.due_date || ''
  status.value = ms.status || 'PENDING'
  progressPercent.value = ms.progress_percent || 0
  isModalOpen.value = true
}

async function handleSaveMilestone() {
  if (!title.value.trim() || !projectId.value) return

  try {
    const payload = {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      due_date: dueDate.value || undefined,
      status: status.value as ProjectMilestone['status'],
      progress_percent: Number(progressPercent.value) || 0,
    }

    if (isEditing.value && editingMilestoneId.value) {
      await updateMilestoneMutation.mutateAsync({
        projectId: projectId.value,
        milestoneId: editingMilestoneId.value,
        payload,
      })
      toast.success(t('projects.milestoneUpdated', 'Milestone updated successfully.'))
    } else {
      await createMilestoneMutation.mutateAsync({
        projectId: projectId.value,
        payload,
      })
      toast.success(t('projects.milestoneCreated', 'Milestone created successfully.'))
    }

    isModalOpen.value = false
    resetForm()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleQuickStatusChange(ms: ProjectMilestone, newStatus: string) {
  if (!projectId.value) return
  try {
    const newProgress = newStatus === 'DONE' ? 100 : ms.progress_percent
    await updateMilestoneMutation.mutateAsync({
      projectId: projectId.value,
      milestoneId: ms.id,
      payload: {
        status: newStatus as ProjectMilestone['status'],
        progress_percent: newProgress,
      },
    })
    toast.success(t('projects.milestoneStatusUpdated', 'Milestone status updated.'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    :title="t('projects.milestonesError', 'Failed to load project milestones')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <BasePageHeader
      :title="t('projects.nav.milestones', 'Project Milestones')"
      :subtitle="
        t('projects.milestonesSubtitle', {
          title: project?.title || '',
        })
      "
    >
      <template #actions>
        <BaseButton size="sm" @click="handleOpenCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          <span>{{ t('projects.addMilestone', 'Add Milestone') }}</span>
        </BaseButton>
      </template>
    </BasePageHeader>

    <EmptyState
      v-if="milestones.length === 0"
      :title="t('projects.noMilestonesTitle', 'No Milestones Set')"
      :description="
        t(
          'projects.noMilestonesDescription',
          'No project milestones have been created for this workspace yet.',
        )
      "
    >
      <template #action>
        <BaseButton size="sm" @click="handleOpenCreateModal">
          <Plus class="h-4 w-4 mr-1.5" />
          <span>{{ t('projects.addMilestone', 'Add Milestone') }}</span>
        </BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="ms in milestones"
        :key="ms.id"
        class="group rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4 hover:border-accent/40 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent"
            >
              <FolderKanban class="h-5 w-5" />
            </div>
            <div>
              <h3
                class="font-bold text-ink text-base cursor-pointer hover:text-accent transition-colors"
                @click="handleOpenEditModal(ms)"
              >
                {{ ms.title }}
              </h3>
              <p v-if="ms.due_date" class="text-xs text-muted">Due: {{ ms.due_date }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <BaseSelect
              :model-value="ms.status"
              label=""
              :options="statusOptions"
              class="text-xs w-32"
              @update:model-value="(val) => handleQuickStatusChange(ms, val)"
            />
          </div>
        </div>

        <p v-if="ms.description" class="text-xs text-muted leading-relaxed">
          {{ ms.description }}
        </p>

        <div class="space-y-1.5 pt-2 border-t border-border/60">
          <div class="flex items-center justify-between text-xs font-medium">
            <span class="text-ink">Completion Progress</span>
            <span class="text-accent font-bold">{{ ms.progress_percent }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div
              class="h-full bg-accent rounded-full transition-all duration-500"
              :style="{ width: `${ms.progress_percent}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Milestone Modal -->
    <BaseModal
      :open="isModalOpen"
      :title="isEditing ? t('projects.editMilestone', 'Edit Milestone') : t('projects.addMilestone', 'Add Milestone')"
      @close="isModalOpen = false"
    >
      <form class="space-y-4 text-xs" @submit.prevent="handleSaveMilestone">
        <BaseInput
          v-model="title"
          :label="t('projects.milestoneTitleLabel', 'Milestone Title')"
          placeholder="e.g. Phase 1: Core Architecture & Setup"
          required
        />

        <BaseTextarea
          v-model="description"
          :label="t('projects.milestoneDescLabel', 'Description / Deliverable Scope')"
          placeholder="Outline deliverables and objectives for this phase..."
          :rows="3"
        />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BaseInput
            v-model="dueDate"
            type="date"
            :label="t('projects.milestoneDueDateLabel', 'Target Target / Due Date')"
          />

          <BaseSelect
            v-model="status"
            :label="t('projects.milestoneStatusLabel', 'Status')"
            :options="statusOptions"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-ink">
            Progress Percentage ({{ progressPercent }}%)
          </label>
          <input
            v-model.number="progressPercent"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full accent-accent cursor-pointer"
          />
        </div>
      </form>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="isModalOpen = false">
          {{ t('common.actions.cancel', 'Cancel') }}
        </BaseButton>
        <BaseButton
          size="sm"
          :loading="createMilestoneMutation.isPending.value || updateMilestoneMutation.isPending.value"
          @click="handleSaveMilestone"
        >
          {{ isEditing ? t('common.actions.save', 'Save Changes') : t('projects.addMilestone', 'Add Milestone') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
