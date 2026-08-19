<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency, stageWidths, type FunnelStage } from '../types'

interface Props {
  stages: FunnelStage[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const rows = computed(() => stageWidths(props.stages))

function stageColor(status: string) {
  if (status === 'WON') return 'bg-emerald-500'
  if (status === 'LOST') return 'bg-rose-500/80'
  if (status === 'PROPOSAL_SENT' || status === 'NEGOTIATION') return 'bg-indigo-500'
  return 'bg-accent'
}
</script>

<template>
  <div class="space-y-4" role="list" :aria-label="t('analytics.funnelChartLabel')">
    <div
      v-for="stage in rows"
      :key="stage.status"
      class="group space-y-1.5 rounded-xl p-2 transition-colors hover:bg-canvas"
      role="listitem"
    >
      <div class="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div class="flex items-center gap-2">
          <span
            class="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
            :class="stageColor(stage.status)"
          />
          <span class="font-medium text-ink">{{ stage.label }}</span>
        </div>

        <div class="flex items-center gap-3 font-mono text-xs">
          <span v-if="stage.value && stage.value !== '0'" class="text-muted">
            {{ formatCurrency(stage.value) }}
          </span>
          <span class="rounded-md border border-border bg-canvas px-2 py-0.5 font-bold text-ink">
            {{ stage.count }}
          </span>
        </div>
      </div>

      <div class="relative h-2.5 w-full overflow-hidden rounded-full bg-border/40">
        <div
          class="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
          :class="stageColor(stage.status)"
          :style="{ width: `${stage.pct}%` }"
        />
      </div>
    </div>
  </div>
</template>
