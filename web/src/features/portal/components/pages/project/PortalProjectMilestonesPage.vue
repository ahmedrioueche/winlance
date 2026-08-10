<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Calendar, CheckCircle2, Clock } from 'lucide-vue-next'

import { EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import { usePortalProjectQuery } from '../../../queries'

const { t, d } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}

function getMilestoneStatusBadgeClass(status: string) {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    case 'IN_PROGRESS':
      return 'bg-accent/15 border-accent/30 text-accent'
    case 'BLOCKED':
      return 'bg-error/15 border-error/30 text-error'
    case 'PENDING':
    default:
      return 'bg-canvas-muted border-border text-muted'
  }
}

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'DONE':
      return CheckCircle2
    case 'IN_PROGRESS':
      return Clock
    default:
      return Calendar
  }
}
</script>

<template>
  <div v-if="isPending" class="space-y-4">
    <Skeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load milestones')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load project milestones.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-xl font-bold tracking-tight text-ink">
          Project Milestones
        </h2>
        <p class="text-xs text-muted">
          Deliverable phases and progress tracking for this project.
        </p>
      </div>
    </div>

    <EmptyState
      v-if="!project.milestones || project.milestones.length === 0"
      :title="t('portal.projects.noMilestonesTitle', 'No Milestones Set')"
      :description="t('portal.projects.noMilestonesDescription', 'No project milestones have been created for this workspace yet.')"
    />

    <div v-else class="space-y-3">
      <div
        v-for="m in project.milestones"
        :key="m.id"
        class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <component
            :is="getMilestoneIcon(m.status)"
            class="h-5 w-5 shrink-0 mt-0.5"
            :class="m.status === 'DONE' ? 'text-emerald-500' : 'text-accent'"
          />
          <div>
            <h4 class="font-display text-sm font-semibold text-ink">
              {{ m.title }}
            </h4>
            <p v-if="m.description" class="mt-0.5 text-xs text-muted">
              {{ m.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 text-xs ml-8 sm:ml-0">
          <span v-if="m.due_date" class="text-muted">
            Due: {{ formatDate(m.due_date) }}
          </span>
          <span
            class="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase"
            :class="getMilestoneStatusBadgeClass(m.status)"
          >
            {{ m.status }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
