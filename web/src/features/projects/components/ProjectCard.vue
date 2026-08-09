<script setup lang="ts">
import {
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  FileSignature,
  FileText,
  Folder,
  Rocket,
  User,
} from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import type { Project } from '../types'

interface Props {
  project: Project
}

const props = defineProps<Props>()
const { t, d } = useI18n()

const statusColorClass = computed(() => {
  switch (props.project.status) {
    case 'ACTIVE':
      return 'bg-accent/15 text-accent border-accent/30'
    case 'COMPLETED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'ON_HOLD':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'CANCELLED':
      return 'bg-error/15 text-error border-error/30'
    case 'DRAFT':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
})

const statusLabel = computed(() => {
  const key = `projects.status.${props.project.status.toLowerCase()}`
  return t(key, props.project.status)
})

const formattedCreatedDate = computed(() => {
  if (!props.project.created_at) return ''
  try {
    return d(new Date(props.project.created_at), 'short')
  } catch {
    return props.project.created_at.split('T')[0] ?? ''
  }
})

const formattedStartDate = computed(() => {
  if (!props.project.start_date) return null
  try {
    return d(new Date(props.project.start_date), 'short')
  } catch {
    return props.project.start_date
  }
})

const formattedDueDate = computed(() => {
  if (!props.project.due_date) return null
  try {
    return d(new Date(props.project.due_date), 'short')
  } catch {
    return props.project.due_date
  }
})

const formattedBudget = computed(() => {
  if (props.project.budget === null || props.project.budget === undefined) return null
  const num = Number(props.project.budget)
  if (Number.isNaN(num)) return null
  const curr = props.project.currency || 'USD'
  return `${curr} ${num.toLocaleString()}`
})

const completedMilestones = computed(() => {
  if (!props.project.milestones || props.project.milestones.length === 0) return null
  const done = props.project.milestones.filter((m) => m.status === 'DONE').length
  return {
    done,
    total: props.project.milestones.length,
    percentage: Math.round((done / props.project.milestones.length) * 100),
  }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'project-workspace-overview', params: { id: project.id } }"
    class="group relative flex flex-col justify-between rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <div>
      <!-- Top Row: Title & Status Badge -->
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-display text-lg font-semibold text-ink transition-colors group-hover:text-accent line-clamp-1">
          {{ project.title }}
        </h3>
        <span
          class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider"
          :class="statusColorClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Client Info & Added Date -->
      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span v-if="project.client_name" class="inline-flex items-center gap-1 font-medium text-ink-soft">
          <User class="h-3 w-3 text-muted" />
          <span>{{ project.client_name }}</span>
        </span>
        <span v-if="project.client_name && project.client_email" class="opacity-40">•</span>
        <span v-if="project.client_email" class="truncate max-w-[180px]">
          {{ project.client_email }}
        </span>
        <span v-if="!project.client_name && !project.client_email" class="italic">
          {{ t('projects.noClientAssigned', 'No client assigned') }}
        </span>

        <!-- Added Date Tag -->
        <span v-if="formattedCreatedDate" class="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-muted">
          <Calendar class="h-3 w-3 text-muted" />
          <span>{{ t('projects.addedDate', { date: formattedCreatedDate }, `Added ${formattedCreatedDate}`) }}</span>
        </span>
      </div>

      <!-- Summary -->
      <p v-if="project.summary" class="mt-3 text-sm text-ink-soft line-clamp-2">
        {{ project.summary }}
      </p>

      <!-- Associated Links & Metadata Badges -->
      <div class="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          v-if="formattedBudget"
          class="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
        >
          <DollarSign class="h-3 w-3" />
          <span>{{ formattedBudget }}</span>
        </span>
        <span
          v-if="formattedStartDate"
          class="inline-flex items-center gap-1 rounded-md bg-canvas-muted px-2 py-0.5 text-[11px] font-medium text-ink-soft border border-border"
        >
          <Rocket class="h-3 w-3 text-muted" />
          <span>Start: {{ formattedStartDate }}</span>
        </span>
        <span
          v-if="formattedDueDate"
          class="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/30"
        >
          <Clock class="h-3 w-3" />
          <span>Due: {{ formattedDueDate }}</span>
        </span>
        <span
          v-if="project.proposal"
          class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent border border-accent/20"
        >
          <FileText class="h-3 w-3" />
          <span>{{ t('projects.proposalLinked', 'Proposal') }}</span>
        </span>
        <span
          v-if="project.contract"
          class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        >
          <FileSignature class="h-3 w-3" />
          <span>{{ t('projects.contractLinked', 'Contract') }}</span>
        </span>
        <span
          v-if="project.files && project.files.length > 0"
          class="inline-flex items-center gap-1 rounded-md bg-canvas-muted px-2 py-0.5 text-[11px] font-medium text-muted border border-border"
        >
          <Folder class="h-3 w-3 text-muted" />
          <span>{{ project.files.length }} {{ t('projects.filesCount', 'files') }}</span>
        </span>
      </div>
    </div>

    <!-- Bottom Row: Milestone Progress Bar or Requirements Count -->
    <div class="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs text-muted">
      <div v-if="completedMilestones" class="flex items-center gap-2.5 w-full">
        <div class="flex-1 h-1.5 rounded-full bg-canvas-muted overflow-hidden">
          <div
            class="h-full bg-accent transition-all duration-300"
            :style="{ width: `${completedMilestones.percentage}%` }"
          />
        </div>
        <span class="shrink-0 font-medium text-ink-soft">
          {{ completedMilestones.done }}/{{ completedMilestones.total }} {{ t('projects.milestones') }} ({{ completedMilestones.percentage }}%)
        </span>
      </div>
      <div v-else-if="project.requirements?.length" class="inline-flex items-center gap-1.5 text-muted font-medium">
        <ClipboardList class="h-3.5 w-3.5 text-muted" />
        <span>{{ project.requirements.length }} {{ t('projects.requirements') }}</span>
      </div>
      <div v-else class="text-muted italic text-[11px]">
        {{ t('projects.noMilestonesYet', 'No milestones yet') }}
      </div>
    </div>
  </RouterLink>
</template>
