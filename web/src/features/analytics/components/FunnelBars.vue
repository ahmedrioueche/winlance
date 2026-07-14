<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { stageWidths, type FunnelStage } from '../types'

interface Props {
  stages: FunnelStage[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const rows = computed(() => stageWidths(props.stages))
</script>

<template>
  <div class="space-y-3" role="list" :aria-label="t('analytics.funnelChartLabel')">
    <div
      v-for="stage in rows"
      :key="stage.status"
      class="space-y-1"
      role="listitem"
    >
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <span class="text-ink">{{ stage.label }}</span>
        <span class="tabular-nums text-muted">{{ stage.count }}</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-border">
        <div
          class="h-full rounded-full bg-accent transition-[width] duration-300"
          :style="{ width: `${stage.pct}%` }"
        />
      </div>
    </div>
  </div>
</template>
