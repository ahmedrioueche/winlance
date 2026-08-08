<script setup lang="ts">
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Folder,
  Save,
  Settings,
  Trash2,
  User,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

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
  useDeleteProjectMutation,
  useProjectQuery,
  useUpdateProjectMutation,
} from '../../queries'
import type { ProjectStatus } from '../../types'

type SettingsSection = 'general' | 'danger'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const updateProjectMutation = useUpdateProjectMutation()
const deleteProjectMutation = useDeleteProjectMutation()

// Active section tab
const activeSection = ref<SettingsSection>('general')

// Form State
const title = ref('')
const summary = ref('')
const status = ref<ProjectStatus>('DRAFT')
const budget = ref('')
const currency = ref('USD')
const startDate = ref('')
const dueDate = ref('')
const clientName = ref('')
const clientEmail = ref('')

// Delete Modal Confirmation State
const isDeleteModalOpen = ref(false)
const confirmInputText = ref('')
const confirmTitleText = ref('')

const statusOptions: SelectOption[] = [
  { value: 'DRAFT', label: t('projects.status.draft', 'Draft') },
  { value: 'ACTIVE', label: t('projects.status.active', 'Active') },
  { value: 'ON_HOLD', label: t('projects.status.on_hold', 'On Hold') },
  { value: 'COMPLETED', label: t('projects.status.completed', 'Completed') },
  { value: 'CANCELLED', label: t('projects.status.cancelled', 'Cancelled') },
]

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]

watch(
  project,
  (p) => {
    if (p) {
      title.value = p.title || ''
      summary.value = p.summary || ''
      status.value = p.status || 'DRAFT'
      budget.value = p.budget != null ? String(p.budget) : ''
      currency.value = p.currency || 'USD'
      startDate.value = p.start_date || ''
      dueDate.value = p.due_date || ''
      clientName.value = p.client_name || ''
      clientEmail.value = p.client_email || ''
    }
  },
  { immediate: true },
)

const navItems: Array<{ id: SettingsSection; label: string; icon: unknown }> = [
  { id: 'general', label: 'General & Overview', icon: Settings },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

async function handleSaveGeneralSettings() {
  if (!projectId.value || !title.value.trim()) return

  try {
    await updateProjectMutation.mutateAsync({
      id: projectId.value,
      payload: {
        title: title.value.trim(),
        summary: summary.value.trim(),
        status: status.value,
        budget: budget.value ? Number(budget.value) : null,
        currency: currency.value,
        start_date: startDate.value || null,
        due_date: dueDate.value || null,
        client_name: clientName.value.trim(),
        client_email: clientEmail.value.trim(),
      },
    })
    toast.success('Project settings updated successfully.')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function handleOpenDeleteModal() {
  confirmInputText.value = ''
  confirmTitleText.value = ''
  isDeleteModalOpen.value = true
}

const isDeleteConfirmed = computed(() => {
  const matchCode = confirmInputText.value.trim().toUpperCase() === 'DELETE'
  const matchTitle = confirmTitleText.value.trim() === (project.value?.title || '').trim()
  return matchCode && matchTitle
})

async function handleConfirmDeleteProject() {
  if (!isDeleteConfirmed.value || !projectId.value) return

  try {
    await deleteProjectMutation.mutateAsync(projectId.value)
    isDeleteModalOpen.value = false
    toast.success('Project deleted successfully.')
    void router.push('/app/projects')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-12">
      <Skeleton class="sm:col-span-4 h-64 rounded-xl" />
      <Skeleton class="sm:col-span-8 h-96 rounded-xl" />
    </div>
  </div>

  <!-- Error State -->
  <ErrorState
    v-else-if="isError"
    title="Failed to load project settings"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <!-- Header Banner -->
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
        Project Settings
      </h1>
      <p class="mt-1 text-sm text-muted">
        Manage workspace parameters, client details, budget, and danger zone actions for {{ project?.title }}
      </p>
    </div>

    <!-- Mobile Horizontal Sub-Navigation Tab Bar -->
    <nav class="flex overflow-x-auto gap-2 pb-2 border-b border-border sm:hidden scrollbar-none" aria-label="Project Settings Mobile Navigation">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition"
        :class="[
          activeSection === item.id
            ? item.id === 'danger'
              ? 'bg-error text-white shadow-sm'
              : 'bg-accent text-accent-contrast shadow-sm'
            : 'bg-canvas-elevated text-muted hover:bg-canvas-muted hover:text-ink',
        ]"
        @click="activeSection = item.id"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Desktop 2-Column Settings Layout (Identical structure to main workspace Settings) -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
      <!-- Left Sub-Navigation Sidebar -->
      <aside class="hidden w-64 shrink-0 rounded-xl border border-border bg-canvas-elevated p-2 shadow-soft sm:block">
        <nav class="space-y-1" aria-label="Project Settings Navigation">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
            :class="[
              activeSection === item.id
                ? item.id === 'danger'
                  ? 'bg-error/15 text-error font-semibold'
                  : 'bg-accent/15 text-accent font-semibold'
                : 'text-ink-soft hover:bg-canvas-muted hover:text-ink',
            ]"
            @click="activeSection = item.id"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- Right Main Content Panel -->
      <main class="flex-1 rounded-xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-6">
        <!-- ═══ GENERAL SETTINGS SECTION ═══ -->
        <div v-if="activeSection === 'general'" class="space-y-6">
          <div>
            <h2 class="font-display text-xl font-semibold text-ink flex items-center gap-2">
              <Folder class="h-5 w-5 text-accent" />
              General Project Configuration
            </h2>
            <p class="mt-1 text-xs text-muted">
              Update project title, status lifecycle, schedule dates, and budget details
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSaveGeneralSettings">
            <!-- Project Title & Status -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div class="sm:col-span-8">
                <BaseInput
                  v-model="title"
                  label="Project Title"
                  placeholder="e.g. E-Commerce Platform Redesign"
                  required
                />
              </div>
              <div class="sm:col-span-4">
                <BaseSelect
                  v-model="status"
                  label="Project Status"
                  :options="statusOptions"
                />
              </div>
            </div>

            <!-- Summary / Description -->
            <BaseTextarea
              v-model="summary"
              label="Project Scope & Summary"
              placeholder="High-level project scope details and deliverables..."
              :rows="3"
            />

            <hr class="border-border/60" />

            <!-- Budget & Currency -->
            <div>
              <h3 class="font-display text-sm font-bold text-ink flex items-center gap-1.5 mb-3">
                <DollarSign class="h-4 w-4 text-emerald-500" />
                Financials & Compensation
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseInput
                  v-model="budget"
                  type="number"
                  label="Project Budget Amount"
                  placeholder="e.g. 5000"
                />
                <BaseSelect
                  v-model="currency"
                  label="Currency"
                  :options="currencyOptions"
                />
              </div>
            </div>

            <hr class="border-border/60" />

            <!-- Schedule & Timeline -->
            <div>
              <h3 class="font-display text-sm font-bold text-ink flex items-center gap-1.5 mb-3">
                <Calendar class="h-4 w-4 text-accent" />
                Timeline & Deadlines
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseInput
                  v-model="startDate"
                  type="date"
                  label="Start Date"
                />
                <BaseInput
                  v-model="dueDate"
                  type="date"
                  label="Target Due Date"
                />
              </div>
            </div>

            <hr class="border-border/60" />

            <!-- Client Contact Details -->
            <div>
              <h3 class="font-display text-sm font-bold text-ink flex items-center gap-1.5 mb-3">
                <User class="h-4 w-4 text-purple-500" />
                Client Profile
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseInput
                  v-model="clientName"
                  label="Client Name"
                  placeholder="Acme Corp / John Smith"
                />
                <BaseInput
                  v-model="clientEmail"
                  type="email"
                  label="Client Email Address"
                  placeholder="client@acme.com"
                />
              </div>
            </div>

            <!-- Submit Action -->
            <div class="flex justify-end pt-2">
              <BaseButton
                type="submit"
                :loading="updateProjectMutation.isPending.value"
              >
                <Save class="h-4 w-4" />
                <span>Save Project Settings</span>
              </BaseButton>
            </div>
          </form>
        </div>

        <!-- ═══ DANGER ZONE SECTION ═══ -->
        <div v-else-if="activeSection === 'danger'" class="space-y-6">
          <div>
            <h2 class="font-display text-xl font-semibold text-error flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-error" />
              Danger Zone
            </h2>
            <p class="mt-1 text-xs text-muted">
              Destructive workspace actions and permanent project deletion
            </p>
          </div>

          <!-- Red Bordered Danger Box -->
          <div class="rounded-2xl border border-error/30 bg-error/5 p-6 shadow-soft space-y-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-error/20 pb-4">
              <div>
                <h3 class="font-display text-base font-bold text-ink">
                  Delete This Project
                </h3>
                <p class="mt-1 text-xs text-muted leading-relaxed max-w-xl">
                  Once you delete a project, there is no recovery. All associated milestones, requirements, tasks, project files, and reports will be permanently deleted from WinLance.
                </p>
              </div>

              <BaseButton
                class="bg-error text-white hover:bg-error/90 border-error shrink-0"
                @click="handleOpenDeleteModal"
              >
                <Trash2 class="h-4 w-4" />
                <span>Delete Project</span>
              </BaseButton>
            </div>

            <div class="flex items-center gap-2 text-xs text-error font-medium">
              <AlertTriangle class="h-4 w-4 shrink-0" />
              <span>Double text verification will be required before final deletion.</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ═══ DOUBLE TEXT INPUT CONFIRMATION MODAL ═══ -->
    <BaseModal
      :open="isDeleteModalOpen"
      title="Delete Project Confirmation"
      @close="isDeleteModalOpen = false"
    >
      <div class="space-y-5 text-xs">
        <!-- Warning Banner -->
        <div class="rounded-xl border border-error/40 bg-error/10 p-4 space-y-2 text-error">
          <div class="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle class="h-5 w-5 shrink-0" />
            <span>Warning: PERMANENT DELETION</span>
          </div>
          <p class="leading-relaxed">
            You are about to delete <strong class="underline">{{ project?.title }}</strong>.
            This action cannot be undone. To prevent accidental loss of project data, please complete BOTH validation fields below.
          </p>
        </div>

        <!-- Input 1: Type DELETE -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-ink">
            1. Type <span class="font-mono font-bold text-error">DELETE</span> in capital letters to confirm intent:
          </label>
          <BaseInput
            v-model="confirmInputText"
            label=""
            placeholder="DELETE"
            class="font-mono uppercase"
          />
        </div>

        <!-- Input 2: Type Project Title -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-ink">
            2. Type the exact project title <span class="font-bold text-ink">"{{ project?.title }}"</span> to confirm target:
          </label>
          <BaseInput
            v-model="confirmTitleText"
            label=""
            :placeholder="project?.title || 'Project Title'"
          />
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="isDeleteModalOpen = false">
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          class="bg-error text-white hover:bg-error/90 border-error disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!isDeleteConfirmed || deleteProjectMutation.isPending.value"
          :loading="deleteProjectMutation.isPending.value"
          @click="handleConfirmDeleteProject"
        >
          <Trash2 class="h-4 w-4" />
          <span>Permanently Delete Project</span>
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
