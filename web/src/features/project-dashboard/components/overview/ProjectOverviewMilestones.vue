<script setup lang="ts">
import { CheckCircle2, Clock } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Milestone } from '../../types'

interface Props {
  milestones: Milestone[]
  projectId: string
}

defineProps<Props>()
</script>

<template>
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
</template>
