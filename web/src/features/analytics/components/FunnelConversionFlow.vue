<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-vue-next'
import type { FunnelStage } from '../types'
import { formatCurrency } from '../types'

interface Props {
  stages: FunnelStage[]
  conversions: Record<string, number>
}

const props = defineProps<Props>()

const flowSteps = computed(() => {
  const steps = props.stages.filter((s) => s.status !== 'LOST')
  const totalLeads = steps[0]?.count || 1

  return steps.map((stage, idx) => {
    const nextStage = steps[idx + 1]
    const conversionKey = nextStage ? `${stage.status}_to_${nextStage.status}` : null
    const conversionRate = conversionKey ? props.conversions[conversionKey] ?? 0 : null
    const pctOfTotal = Math.round((stage.count / totalLeads) * 100)

    return {
      ...stage,
      pctOfTotal,
      conversionRate,
      hasNext: Boolean(nextStage),
    }
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-display text-lg font-semibold text-ink">Conversion Journey</h3>
        <p class="text-xs text-muted">Lead progression efficiency through key pipeline stages</p>
      </div>
      <div class="flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3 py-1 text-xs text-muted">
        <TrendingUp class="h-3.5 w-3.5 text-accent" />
        <span>Happy Path Flow</span>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
      <template v-for="(step, idx) in flowSteps" :key="step.status">
        <div
          class="relative flex flex-col justify-between rounded-xl border border-border/80 bg-canvas p-3.5 shadow-xs transition-all hover:border-accent/30 hover:shadow-soft"
        >
          <div>
            <div class="flex items-center justify-between gap-1 text-xs text-muted">
              <span class="font-mono text-[10px] font-semibold text-accent uppercase">Step {{ idx + 1 }}</span>
              <CheckCircle2 v-if="step.status === 'WON'" class="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p class="mt-1 font-medium text-sm text-ink truncate" :title="step.label">
              {{ step.label }}
            </p>
          </div>

          <div class="mt-4 space-y-1.5">
            <div class="flex items-baseline justify-between">
              <span class="font-mono text-xl font-bold text-ink">{{ step.count }}</span>
              <span class="text-[11px] font-medium text-muted">{{ step.pctOfTotal }}%</span>
            </div>

            <!-- Value badge if available -->
            <p v-if="step.value && step.value !== '0'" class="text-[11px] font-mono text-accent">
              {{ formatCurrency(step.value) }}
            </p>

            <div class="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                class="h-full rounded-full bg-gradient-to-r from-accent to-indigo-500 transition-all duration-500"
                :style="{ width: `${Math.max(step.pctOfTotal, 6)}%` }"
              />
            </div>
          </div>

          <!-- Step transition arrow with conversion rate -->
          <div
            v-if="step.hasNext && step.conversionRate != null"
            class="mt-3 flex items-center justify-center gap-1 rounded-md bg-accent/5 py-1 text-[11px] font-semibold text-accent"
          >
            <span>{{ step.conversionRate }}%</span>
            <ArrowRight class="h-3 w-3" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
