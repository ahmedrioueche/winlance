<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckCircle2, DollarSign, FileText, FolderKanban } from 'lucide-vue-next'

interface Props {
  totalRevenueFormatted: string
  activeProjectsCount: number
  totalProposalsCount: number
  winRatePercent: number
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Revenue -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
      <div class="flex items-center justify-between text-xs text-muted font-medium">
        <span>{{ t('clients.overview.totalRevenue') }}</span>
        <DollarSign class="h-4 w-4 text-emerald-500" />
      </div>
      <div>
        <span class="font-display text-2xl font-bold text-ink">{{ totalRevenueFormatted }}</span>
      </div>
      <p class="text-xs text-muted">Combined contract value</p>
    </div>

    <!-- Active Projects -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
      <div class="flex items-center justify-between text-xs text-muted font-medium">
        <span>{{ t('clients.overview.activeProjects') }}</span>
        <FolderKanban class="h-4 w-4 text-accent" />
      </div>
      <div>
        <span class="font-display text-2xl font-bold text-ink">{{ activeProjectsCount }}</span>
      </div>
      <p class="text-xs text-muted">Ongoing engagements</p>
    </div>

    <!-- Total Proposals -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
      <div class="flex items-center justify-between text-xs text-muted font-medium">
        <span>{{ t('clients.overview.totalProposals') }}</span>
        <FileText class="h-4 w-4 text-purple-500" />
      </div>
      <div>
        <span class="font-display text-2xl font-bold text-ink">{{ totalProposalsCount }}</span>
      </div>
      <p class="text-xs text-muted">Proposals generated</p>
    </div>

    <!-- Win Rate -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3">
      <div class="flex items-center justify-between text-xs text-muted font-medium">
        <span>{{ t('clients.overview.winRate') }}</span>
        <CheckCircle2 class="h-4 w-4 text-accent" />
      </div>
      <div class="flex items-baseline justify-between">
        <span class="font-display text-2xl font-bold text-ink">{{ winRatePercent }}%</span>
      </div>
      <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
        <div class="h-full bg-accent rounded-full transition-all duration-500" :style="{ width: `${winRatePercent}%` }" />
      </div>
    </div>
  </div>
</template>
