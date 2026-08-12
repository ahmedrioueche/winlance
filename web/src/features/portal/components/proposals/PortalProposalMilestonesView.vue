<script setup lang="ts">
import { computed } from 'vue'
import { CheckSquare, DollarSign, Layers, Sparkles } from 'lucide-vue-next'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
}

const props = defineProps<Props>()

const milestonesList = computed(() => {
  return props.proposal?.milestones || []
})

const milestoneSum = computed(() => {
  return milestonesList.value.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
})
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Sparkles class="h-5 w-5" />
        </div>
        <div>
          <h3 class="font-display text-base font-bold text-ink">
            Milestones &amp; Deliverables Breakdown
          </h3>
          <p class="text-xs text-muted">
            Structured project roadmap and phase deliverables
          </p>
        </div>
      </div>

      <div
        v-if="milestoneSum > 0"
        class="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
      >
        <DollarSign class="h-3.5 w-3.5" />
        <span>Total Milestone Investment: ${{ milestoneSum.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal?.currency || 'USD' }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="milestonesList.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-canvas p-8 text-center space-y-2"
    >
      <Layers class="h-8 w-8 text-muted/50" />
      <p class="text-xs font-semibold text-ink">No Milestones Specified</p>
      <p class="text-[11px] text-muted max-w-sm">
        This proposal has not been broken down into separate milestone phases. Please refer to the Executive Document view for complete proposal details.
      </p>
    </div>

    <!-- Milestones List -->
    <div v-else class="space-y-4">
      <div
        v-for="(m, idx) in milestonesList"
        :key="m.id || idx"
        class="rounded-xl border border-border bg-canvas p-5 shadow-xs space-y-4"
      >
        <!-- Milestone Header -->
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="rounded-lg bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                Phase {{ idx + 1 }}
              </span>
              <h4 class="font-display text-sm font-bold text-ink">
                {{ m.title || `Phase ${idx + 1}` }}
              </h4>
            </div>
            <p v-if="m.description" class="text-xs text-muted leading-relaxed">
              {{ m.description }}
            </p>
          </div>

          <div v-if="Number(m.amount)" class="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>${{ Number(m.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <!-- Deliverables Checklist -->
        <div v-if="m.deliverables && m.deliverables.length > 0" class="space-y-2 pt-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Deliverables &amp; Task Checklist
          </span>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              v-for="(del, dIdx) in m.deliverables"
              :key="dIdx"
              class="flex items-center gap-2 rounded-lg border border-border/60 bg-canvas-elevated px-3 py-2 text-xs text-ink"
            >
              <CheckSquare class="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{{ del }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
