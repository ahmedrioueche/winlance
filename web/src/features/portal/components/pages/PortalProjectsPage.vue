<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
} from 'lucide-vue-next'

import {
  BaseButton,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'

import { usePortalInfoQuery, usePortalProjectsQuery } from '../../queries'
import type { PortalProject } from '../../types'

const { t, d } = useI18n()
const route = useRoute()
const router = useRouter()
const token = computed(() => String(route.params.token || ''))

const { data: portalInfo } = usePortalInfoQuery(token)
const {
  data: projects,
  isPending,
  isError,
  refetch,
} = usePortalProjectsQuery(token)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'bg-accent/15 border-accent/30 text-accent'
    case 'COMPLETED':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    case 'ON_HOLD':
      return 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
    default:
      return 'bg-canvas-muted border-border text-muted'
  }
}

function handleOpenProject(project: PortalProject) {
  void router.push({
    name: 'portal-project-overview',
    params: { token: token.value, projectId: project.id },
  })
}
</script>

<template>
  <section class="space-y-6">
    <!-- Section Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ t('portal.projects.title', 'Projects & Milestones') }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ t('portal.projects.subtitle', 'Active project progress and deliverable tracking') }}
          <span v-if="portalInfo?.company_name || portalInfo?.client_name" class="font-semibold text-ink">
            • {{ portalInfo?.company_name || portalInfo?.client_name }}
          </span>
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-64 rounded-2xl" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="isError"
      :title="t('portal.projects.errorTitle', 'Failed to load projects')"
      :message="t('portal.projects.errorMessage', 'An error occurred while loading projects for your workspace.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!projects || projects.length === 0"
      :title="t('portal.projects.emptyTitle', 'No Active Projects')"
      :description="t('portal.projects.emptyDescription', 'There are no active project workspaces linked to your client account at this time.')"
    />

    <!-- Active Projects Grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative flex flex-col justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift cursor-pointer space-y-5"
        @click="handleOpenProject(project)"
      >
        <div>
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
                <FolderKanban class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-display text-base font-bold text-ink transition-colors group-hover:text-accent line-clamp-1">
                  {{ project.title }}
                </h3>
                <p v-if="project.summary" class="text-xs text-muted line-clamp-1 mt-0.5">
                  {{ project.summary }}
                </p>
              </div>
            </div>
            <span
              class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase"
              :class="getStatusBadgeClass(project.status)"
            >
              {{ project.status }}
            </span>
          </div>

          <!-- Progress Bar Indicator -->
          <div class="mt-5 space-y-1.5">
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

          <!-- Milestones & Deliverables Stats -->
          <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted pt-3 border-t border-border/60">
            <span v-if="project.milestones_count !== undefined" class="inline-flex items-center gap-1.5 font-medium">
              <CheckCircle2 class="h-4 w-4 text-emerald-500" />
              <span>
                {{ project.done_milestones_count ?? 0 }}/{{ project.milestones_count }}
                {{ t('portal.projects.milestonesCompleted', 'Milestones Done') }}
              </span>
            </span>

            <span v-if="project.due_date" class="inline-flex items-center gap-1.5 font-medium ml-auto">
              <Clock class="h-3.5 w-3.5 text-muted" />
              <span>Due: {{ formatDate(project.due_date) }}</span>
            </span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex items-center justify-between text-xs">
          <span class="text-muted font-medium inline-flex items-center gap-1">
            <Calendar v-if="project.start_date" class="h-3.5 w-3.5" />
            <span v-if="project.start_date">Started: {{ formatDate(project.start_date) }}</span>
          </span>

          <BaseButton variant="ghost" size="sm" class="group-hover:text-accent">
            <span>{{ t('portal.projects.viewWorkspace', 'View Workspace') }}</span>
            <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
