<script setup lang="ts">
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  FolderKanban,
  Globe,
  Plus,
  User,
} from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { BaseButton, ErrorState, Skeleton } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useProjectQuery } from '../../queries'

const route = useRoute()
const toast = useToast()

const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const milestones = computed(() => project.value?.milestones ?? [])
const requirements = computed(() => project.value?.requirements ?? [])

const completedMilestones = computed(() => milestones.value.filter((m) => m.status === 'DONE').length)
const overallProgressPercent = computed(() => {
  if (milestones.value.length === 0) return 0
  const total = milestones.value.reduce((acc, m) => acc + (m.progress_percent || 0), 0)
  return Math.round(total / milestones.value.length)
})

function formatCurrency(val?: number | string | null, curr = 'USD') {
  const n = Number(val || 0)
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${curr}`
}

function handleCopyPortalLink() {
  const shareUrl = `${window.location.origin}/portal`
  navigator.clipboard.writeText(shareUrl)
  toast.success('Client portal link copied to clipboard!')
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-32 w-full rounded-2xl" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
    </div>
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <!-- Error State -->
  <ErrorState
    v-else-if="isError"
    title="Failed to load project details"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
            {{ project?.title || 'Project Workspace' }}
          </h1>
          <span class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
            {{ project?.status || 'Active' }}
          </span>
        </div>
        <p class="text-sm text-muted">
          {{ project?.summary || 'Project overview, milestone deliverables, and client scope tracking.' }}
        </p>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex shrink-0 items-center gap-2.5">
        <BaseButton variant="secondary" size="sm" @click="handleCopyPortalLink">
          <Globe class="h-3.5 w-3.5 text-accent" />
          <span>Client Portal Link</span>
        </BaseButton>
        <BaseButton size="sm" @click="$router.push(`/app/projects/${projectId}/tasks`)">
          <Plus class="h-3.5 w-3.5" />
          <span>Add Task</span>
        </BaseButton>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Overall Progress Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
        <div class="flex items-center justify-between text-xs text-muted font-medium">
          <span>Overall Progress</span>
          <FolderKanban class="h-4 w-4 text-accent" />
        </div>
        <div class="flex items-baseline justify-between">
          <span class="font-display text-2xl font-bold text-ink">{{ overallProgressPercent }}%</span>
          <span class="text-xs text-muted">{{ completedMilestones }} of {{ milestones.length }} done</span>
        </div>
        <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
          <div class="h-full bg-accent rounded-full transition-all duration-500" :style="{ width: `${overallProgressPercent}%` }" />
        </div>
      </div>

      <!-- Budget Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
        <div class="flex items-center justify-between text-xs text-muted font-medium">
          <span>Project Budget</span>
          <DollarSign class="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <span class="font-display text-xl font-bold text-ink">{{ formatCurrency(project?.budget, project?.currency) }}</span>
        </div>
        <p class="text-xs text-muted">Contracted deliverable value</p>
      </div>

      <!-- Timeline Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
        <div class="flex items-center justify-between text-xs text-muted font-medium">
          <span>Target Schedule</span>
          <Calendar class="h-4 w-4 text-purple-500" />
        </div>
        <div class="text-xs text-ink space-y-1 font-medium">
          <div class="flex items-center justify-between">
            <span class="text-muted">Start:</span>
            <span>{{ project?.start_date || 'Not set' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted">Due:</span>
            <span>{{ project?.due_date || 'Not set' }}</span>
          </div>
        </div>
      </div>

      <!-- Client Info Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
        <div class="flex items-center justify-between text-xs text-muted font-medium">
          <span>Client Entity</span>
          <User class="h-4 w-4 text-accent" />
        </div>
        <div>
          <h4 class="font-bold text-sm text-ink truncate">{{ project?.client_name || 'Client Unassigned' }}</h4>
          <p class="text-xs text-muted truncate">{{ project?.client_email || 'No contact email' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Layout (Milestones + Requirements) -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Active Milestones List (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 class="font-display text-base font-bold text-ink">Project Milestones</h2>
              <p class="text-xs text-muted">Key deliverable phases and target completion percent</p>
            </div>
            <BaseButton variant="secondary" size="sm" @click="$router.push(`/app/projects/${projectId}/milestones`)">
              View All
            </BaseButton>
          </div>

          <div v-if="milestones.length === 0" class="text-xs text-muted text-center py-8">
            No milestones configured for this project yet.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="ms in milestones"
              :key="ms.id"
              class="rounded-xl border border-border/80 bg-canvas p-4 text-xs space-y-3"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-2.5">
                  <CheckCircle2 v-if="ms.status === 'DONE'" class="h-4 w-4 text-emerald-500 shrink-0" />
                  <Clock v-else class="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <h3 class="font-bold text-ink text-sm">{{ ms.title }}</h3>
                    <p v-if="ms.description" class="text-muted mt-0.5">{{ ms.description }}</p>
                  </div>
                </div>
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                  :class="ms.status === 'DONE' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-accent-soft text-accent'"
                >
                  {{ ms.status }}
                </span>
              </div>

              <!-- Progress bar -->
              <div class="space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted">Phase Progress</span>
                  <span class="font-bold text-ink">{{ ms.progress_percent }}%</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-canvas-muted overflow-hidden">
                  <div class="h-full bg-accent rounded-full transition-all duration-300" :style="{ width: `${ms.progress_percent}%` }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Deliverables & Requirements Checklist (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
              <FileText class="h-4 w-4 text-accent" />
              Scope Requirements
            </span>
            <span class="text-xs text-muted">({{ requirements.length }})</span>
          </div>

          <div v-if="requirements.length === 0" class="text-xs text-muted text-center py-6">
            No scope requirements recorded yet.
          </div>

          <div v-else class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            <div
              v-for="req in requirements"
              :key="req.id"
              class="rounded-xl border border-border/80 bg-canvas p-3 text-xs space-y-1"
            >
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-ink">{{ req.title }}</h4>
                <span class="text-[10px] text-muted uppercase">{{ req.created_by_role }}</span>
              </div>
              <p v-if="req.description" class="text-muted text-[11px] leading-relaxed">
                {{ req.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
