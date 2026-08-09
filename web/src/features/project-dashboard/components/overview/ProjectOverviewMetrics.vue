<script setup lang="ts">
import { Calendar, DollarSign, FolderKanban, User } from 'lucide-vue-next'
import type { Project } from '../../types'

interface Props {
  project?: Project
  overallProgressPercent: number
  completedMilestones: number
  milestonesCount: number
  formattedBudget: string
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Overall Progress Card -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
      <div class="flex items-center justify-between text-xs text-muted font-medium">
        <span>Overall Progress</span>
        <FolderKanban class="h-4 w-4 text-accent" />
      </div>
      <div class="flex items-baseline justify-between">
        <span class="font-display text-2xl font-bold text-ink">{{ overallProgressPercent }}%</span>
        <span class="text-xs text-muted">{{ completedMilestones }} of {{ milestonesCount }} done</span>
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
        <span class="font-display text-xl font-bold text-ink">{{ formattedBudget }}</span>
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
</template>
