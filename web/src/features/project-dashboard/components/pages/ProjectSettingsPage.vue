<script setup lang="ts">
import { AlertTriangle, Settings } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BasePageHeader, ErrorState, Skeleton } from '@/shared/components/base'
import { useProjectSettingsForm, type SettingsSection } from '../../composables/settings/useProjectSettingsForm'
import ProjectSettingsDangerZone from '../settings/ProjectSettingsDangerZone.vue'
import ProjectSettingsDeleteModal from '../settings/ProjectSettingsDeleteModal.vue'
import ProjectSettingsGeneralForm from '../settings/ProjectSettingsGeneralForm.vue'

const route = useRoute()
const projectId = computed(() => String(route.params.id || ''))

const {
  project,
  isPending,
  isError,
  refetch,
  activeSection,
  title,
  summary,
  status,
  budget,
  currency,
  startDate,
  dueDate,
  clientName,
  clientEmail,
  isDeleteModalOpen,
  confirmInputText,
  confirmTitleText,
  isDeleteConfirmed,
  isSaving,
  isDeleting,
  handleSaveGeneralSettings,
  handleOpenDeleteModal,
  handleConfirmDeleteProject,
} = useProjectSettingsForm(projectId)

const navItems: Array<{ id: SettingsSection; label: string; icon: unknown }> = [
  { id: 'general', label: 'General & Overview', icon: Settings },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-12">
      <Skeleton class="sm:col-span-4 h-64 rounded-xl" />
      <Skeleton class="sm:col-span-8 h-96 rounded-xl" />
    </div>
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load project settings"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <BasePageHeader
      title="Project Settings"
      :subtitle="`Manage workspace parameters, client details, budget, and danger zone actions for ${project?.title || ''}`"
    />

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

    <!-- Desktop 2-Column Settings Layout -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
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

      <main class="flex-1 rounded-xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-6">
        <ProjectSettingsGeneralForm
          v-if="activeSection === 'general'"
          v-model:title="title"
          v-model:summary="summary"
          v-model:status="status"
          v-model:budget="budget"
          v-model:currency="currency"
          v-model:start-date="startDate"
          v-model:due-date="dueDate"
          v-model:client-name="clientName"
          v-model:client-email="clientEmail"
          :is-saving="isSaving"
          @save="handleSaveGeneralSettings"
        />

        <ProjectSettingsDangerZone
          v-else-if="activeSection === 'danger'"
          @open-delete-modal="handleOpenDeleteModal"
        />
      </main>
    </div>

    <!-- Delete Modal -->
    <ProjectSettingsDeleteModal
      v-model:confirm-input-text="confirmInputText"
      v-model:confirm-title-text="confirmTitleText"
      :open="isDeleteModalOpen"
      :project-title="project?.title || ''"
      :is-deleting="isDeleting"
      :is-confirmed="isDeleteConfirmed"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDeleteProject"
    />
  </section>
</template>
