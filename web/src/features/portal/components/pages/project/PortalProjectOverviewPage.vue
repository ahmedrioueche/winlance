<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  Calendar,
  DollarSign,
  FolderKanban,
} from 'lucide-vue-next'

import {
  BaseCardHeader,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'

import { usePortalProjectQuery } from '../../../queries'

const { t, d } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const {
  data: project,
  isPending,
  isError,
  refetch,
} = usePortalProjectQuery(token, projectId)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A'
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-32 w-full rounded-2xl" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
    </div>
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load project')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load project overview.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-8">
    <!-- Project Overview Header Card -->
    <BaseCardHeader
      :title="project.title"
      :subtitle="project.summary || t('portal.projects.defaultSummary', 'Project workspace overview and milestone progress.')"
    >
      <template #badge>
        <span class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
          {{ project.status }}
        </span>
      </template>

      <template #actions>
        <div class="flex items-center gap-3 text-xs text-muted">
          <span v-if="project.due_date" class="font-semibold text-ink">
            Due: {{ formatDate(project.due_date) }}
          </span>
        </div>
      </template>

      <template #meta>
        <!-- Milestone Progress Bar -->
        <div class="space-y-1.5 pt-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-ink">
              {{ t('portal.projects.milestoneProgress', 'Milestone Completion') }}
            </span>
            <span class="font-bold text-accent">
              {{ project.progress_percent ?? 0 }}%
            </span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div
              class="h-full bg-accent rounded-full transition-all duration-500"
              :style="{ width: `${project.progress_percent ?? 0}%` }"
            />
          </div>
        </div>
      </template>
    </BaseCardHeader>

    <!-- Overview Key Metrics Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Metric 1: Milestone Progress -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent shrink-0">
          <FolderKanban class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs font-medium text-muted">Done Milestones</p>
          <p class="font-display text-xl font-bold text-ink">
            {{ project.done_milestones_count ?? 0 }} / {{ project.milestones_count ?? 0 }}
          </p>
        </div>
      </div>

      <!-- Metric 2: Target Deadline -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Calendar class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs font-medium text-muted">Target Deadline</p>
          <p class="font-display text-base font-bold text-ink">
            {{ formatDate(project.due_date) }}
          </p>
        </div>
      </div>

      <!-- Metric 3: Budget / Currency -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft flex items-center gap-4 sm:col-span-2 lg:col-span-1">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
          <DollarSign class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs font-medium text-muted">Project Budget</p>
          <p class="font-display text-xl font-bold text-ink">
            ${{ Number(project.budget || 0).toLocaleString() }} {{ project.currency || 'USD' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Overview Summary Box -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-3">
      <h3 class="font-display text-base font-bold text-ink">
        About This Project
      </h3>
      <p class="text-xs text-muted leading-relaxed whitespace-pre-line">
        {{ project.summary || 'No project summary provided.' }}
      </p>
    </div>
  </section>
</template>
