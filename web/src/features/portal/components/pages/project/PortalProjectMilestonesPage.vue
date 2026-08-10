<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Calendar, CheckCheck, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-vue-next'

import { BaseButton, EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import { useApprovePortalMilestoneMutation, usePortalProjectQuery } from '../../../queries'
import { useToast } from '@/shared/toast/useToast'
import type { PortalMilestone } from '../../../types'

const { t, d } = useI18n()
const route = useRoute()
const toast = useToast()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)
const approveMilestoneMutation = useApprovePortalMilestoneMutation()

const approvingMilestoneId = ref<string | null>(null)

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
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
    case 'READY_FOR_SIGNOFF':
      return 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold animate-pulse'
    case 'IN_PROGRESS':
      return 'bg-accent/15 border-accent/30 text-accent font-semibold'
    case 'BLOCKED':
      return 'bg-error/15 border-error/30 text-error font-semibold'
    case 'PENDING':
    default:
      return 'bg-canvas-muted border-border text-muted'
  }
}

function formatStatusText(status: string) {
  if (status === 'READY_FOR_SIGNOFF') return 'Ready For Sign-off'
  return status.replace('_', ' ')
}

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'DONE':
      return CheckCircle2
    case 'READY_FOR_SIGNOFF':
      return Sparkles
    case 'IN_PROGRESS':
      return Clock
    default:
      return Calendar
  }
}

async function handleApproveMilestone(milestone: PortalMilestone) {
  approvingMilestoneId.value = milestone.id
  try {
    await approveMilestoneMutation.mutateAsync({
      token: token.value,
      projectId: projectId.value,
      milestoneId: milestone.id,
    })
    toast.success('portal.projects.milestoneApproved', { milestone: milestone.title })
    await refetch()
  } catch (err) {
    toast.errorFromUnknown(err)
  } finally {
    approvingMilestoneId.value = null
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
          Project Milestones &amp; Sign-offs
        </h2>
        <p class="text-xs text-muted">
          Sequential deliverable phases and milestone acceptance approvals for this project.
        </p>
      </div>
    </div>

    <EmptyState
      v-if="!project.milestones || project.milestones.length === 0"
      :title="t('portal.projects.noMilestonesTitle', 'No Milestones Set')"
      :description="t('portal.projects.noMilestonesDescription', 'No project milestones have been created for this workspace yet.')"
    />

    <div v-else class="space-y-4">
      <div
        v-for="m in project.milestones"
        :key="m.id"
        class="rounded-2xl border bg-canvas-elevated p-5 shadow-soft transition-all"
        :class="[
          m.status === 'READY_FOR_SIGNOFF'
            ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
            : 'border-border',
        ]"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <component
              :is="getMilestoneIcon(m.status)"
              class="h-5 w-5 shrink-0 mt-0.5"
              :class="[
                m.status === 'DONE'
                  ? 'text-emerald-500'
                  : m.status === 'READY_FOR_SIGNOFF'
                    ? 'text-amber-500'
                    : 'text-accent',
              ]"
            />
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-display text-sm font-semibold text-ink">
                  {{ m.title }}
                </h4>
              </div>
              <p v-if="m.description" class="mt-0.5 text-xs text-muted">
                {{ m.description }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0 text-xs ml-8 sm:ml-0">
            <span v-if="m.due_date" class="text-muted">
              Target: {{ formatDate(m.due_date) }}
            </span>
            <span
              class="rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider"
              :class="getMilestoneStatusBadgeClass(m.status)"
            >
              {{ formatStatusText(m.status) }}
            </span>

            <!-- Milestone Sign-Off Action Button -->
            <BaseButton
              v-if="m.status === 'READY_FOR_SIGNOFF'"
              size="sm"
              :disabled="approvingMilestoneId === m.id"
              @click="handleApproveMilestone(m)"
            >
              <Loader2 v-if="approvingMilestoneId === m.id" class="h-3.5 w-3.5 animate-spin" />
              <CheckCheck v-else class="h-3.5 w-3.5" />
              <span>Approve &amp; Sign Off Milestone</span>
            </BaseButton>
          </div>
        </div>

        <!-- Banner for Ready for Sign-Off -->
        <div
          v-if="m.status === 'READY_FOR_SIGNOFF'"
          class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"
        >
          <div class="flex items-center gap-2">
            <Sparkles class="h-4 w-4 shrink-0 text-amber-500" />
            <span>All tasks for this milestone are complete! Please review and click <strong>Approve &amp; Sign Off Milestone</strong> to accept this deliverable phase.</span>
          </div>
          <BaseButton
            size="sm"
            :disabled="approvingMilestoneId === m.id"
            @click="handleApproveMilestone(m)"
          >
            <Loader2 v-if="approvingMilestoneId === m.id" class="h-3.5 w-3.5 animate-spin" />
            <CheckCheck v-else class="h-3.5 w-3.5" />
            <span>Sign Off</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
