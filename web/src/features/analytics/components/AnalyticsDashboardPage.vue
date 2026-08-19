<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  FileText,
  FolderCheck,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-vue-next'

import {
  BasePageHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'

import { useFunnelQuery, useRefreshSnapshotMutation, useSummaryQuery } from '../queries'
import { formatCurrency } from '../types'
import FunnelBars from './FunnelBars.vue'
import FunnelConversionFlow from './FunnelConversionFlow.vue'
import KpiCard from './KpiCard.vue'
import Sparkline from './Sparkline.vue'

const { t } = useI18n()
const timeframe = ref<'all' | '30d'>('all')

const funnelQuery = useFunnelQuery()
const summaryQuery = useSummaryQuery()
const refreshMutation = useRefreshSnapshotMutation()

const funnel = computed(() => funnelQuery.data.value)
const summary = computed(() => summaryQuery.data.value)
const kpis = computed(() => summary.value?.kpis)

const stageSpark = computed(() => (funnel.value?.stages ?? []).map((stage) => stage.count))
const conversionSpark = computed(() =>
  Object.values(funnel.value?.conversions ?? {}).map((value) => Number(value) || 0),
)

const pending = computed(() => funnelQuery.isPending.value || summaryQuery.isPending.value)
const errored = computed(() => funnelQuery.isError.value || summaryQuery.isError.value)

const proposalAcceptRate = computed(() => {
  if (!funnel.value?.proposals.total) return 0
  return Math.round((funnel.value.proposals.accepted / funnel.value.proposals.total) * 100)
})

const contractSignRate = computed(() => {
  if (!funnel.value?.contracts.total) return 0
  return Math.round((funnel.value.contracts.signed / funnel.value.contracts.total) * 100)
})

const lastRefreshedText = computed(() => {
  if (summary.value?.latest_snapshot_at) {
    return new Date(summary.value.latest_snapshot_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (funnel.value?.generated_at) {
    return new Date(funnel.value.generated_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return null
})

function retry() {
  void funnelQuery.refetch()
  void summaryQuery.refetch()
}

function handleRefreshSnapshot() {
  refreshMutation.mutate()
}
</script>

<template>
  <section class="w-full space-y-8">
    <!-- Header with controls -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <BasePageHeader
        :title="t('analytics.title', 'Analytics & Pipeline Intelligence')"
        :subtitle="t('analytics.subtitle', 'Track lead conversion rates, revenue pipeline velocity, and document performance')"
      />

      <div class="flex flex-wrap items-center gap-3">
        <!-- Timeframe filter pills -->
        <div class="inline-flex rounded-xl border border-border bg-canvas-elevated p-1 shadow-xs">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="
              timeframe === 'all'
                ? 'bg-accent text-white shadow-xs'
                : 'text-muted hover:text-ink'
            "
            @click="timeframe = 'all'"
          >
            All Time
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="
              timeframe === '30d'
                ? 'bg-accent text-white shadow-xs'
                : 'text-muted hover:text-ink'
            "
            @click="timeframe = '30d'"
          >
            Last 30 Days
          </button>
        </div>

        <!-- Refresh Snapshot button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-border bg-canvas-elevated px-3.5 py-2 text-xs font-semibold text-ink shadow-xs transition-all hover:border-accent/40 hover:bg-canvas hover:shadow-soft active:scale-95 disabled:opacity-50"
          :disabled="refreshMutation.isPending.value"
          @click="handleRefreshSnapshot"
        >
          <RefreshCw
            class="h-3.5 w-3.5 text-accent"
            :class="{ 'animate-spin': refreshMutation.isPending.value }"
          />
          <span>{{ refreshMutation.isPending.value ? 'Refreshing...' : 'Refresh Snapshot' }}</span>
        </button>
      </div>
    </div>

    <!-- Loading / Error / Empty States -->
    <LoadingState v-if="pending" />
    <ErrorState
      v-else-if="errored"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="retry"
    />
    <EmptyState
      v-else-if="!funnel || !kpis"
      :title="t('analytics.empty', 'No analytics data available yet')"
    />

    <template v-else>
      <!-- Hero KPI Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          :label="t('analytics.kpis.pipeline', 'Open Pipeline')"
          :value="formatCurrency(kpis.pipeline_value)"
          :badge="`${kpis.open_leads} active leads`"
          variant="accent"
          :icon="DollarSign"
          hint="Estimated total value of active pipeline leads"
        />

        <KpiCard
          :label="t('analytics.kpis.wonValue', 'Won Revenue')"
          :value="formatCurrency(kpis.won_value)"
          :badge="`${kpis.win_rate}% win rate`"
          variant="success"
          :icon="Trophy"
          hint="Total revenue from closed won deals"
        />

        <KpiCard
          :label="t('analytics.kpis.proposalsSent', 'Proposals & Contracts')"
          :value="`${kpis.proposals_sent} / ${kpis.contracts_signed}`"
          :badge="`${proposalAcceptRate}% accepted`"
          variant="default"
          :icon="FileText"
          hint="Proposals sent vs contracts signed"
        />

        <KpiCard
          :label="t('analytics.kpis.activeProjects', 'Active Deliveries')"
          :value="kpis.active_projects"
          badge="Active"
          variant="default"
          :icon="FolderCheck"
          hint="Live client portal projects in execution"
        />
      </div>

      <!-- Conversion Flow Section -->
      <section class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
        <FunnelConversionFlow :stages="funnel.stages" :conversions="funnel.conversions" />
      </section>

      <!-- Main Analytics Grid: Funnel & Summary -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Stage Distribution Chart -->
        <section class="flex flex-col justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <BarChart3 class="h-5 w-5 text-accent" />
                <h2 class="font-display text-xl font-bold text-ink">
                  {{ t('analytics.funnel', 'Pipeline Stage Distribution') }}
                </h2>
              </div>
              <p class="mt-1 text-xs text-muted">
                {{ t('analytics.funnelHint', 'Lead count and estimated dollar value across each stage') }}
              </p>
            </div>
            <div class="w-32">
              <Sparkline :values="stageSpark" :label="t('analytics.stageSpark', 'Pipeline Trend')" />
            </div>
          </div>

          <FunnelBars :stages="funnel.stages" />
        </section>

        <!-- Summary & Document Performance -->
        <section class="space-y-6 rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <Sparkles class="h-5 w-5 text-indigo-500" />
                <h2 class="font-display text-xl font-bold text-ink">
                  {{ t('analytics.summary', 'Sales Conversion Metrics') }}
                </h2>
              </div>
              <p class="mt-1 text-xs text-muted">
                {{ t('analytics.summaryHint', 'Pipeline totals and document closing rates') }}
              </p>
            </div>
            <div class="w-32">
              <Sparkline :values="conversionSpark" :label="t('analytics.conversionSpark', 'Conversion Trend')" />
            </div>
          </div>

          <!-- Metric Summary Cards -->
          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-border bg-canvas p-4 transition-colors hover:border-accent/30">
              <div class="flex items-center justify-between text-xs text-muted">
                <dt>{{ t('analytics.totals.leads', 'Total Leads Captured') }}</dt>
                <Users class="h-4 w-4 text-accent" />
              </div>
              <dd class="mt-2 font-mono text-2xl font-bold text-ink">{{ funnel.total_leads }}</dd>
            </div>

            <div class="rounded-xl border border-border bg-canvas p-4 transition-colors hover:border-emerald-500/30">
              <div class="flex items-center justify-between text-xs text-muted">
                <dt>{{ t('analytics.totals.won', 'Won Deals') }}</dt>
                <CheckCircle2 class="h-4 w-4 text-emerald-500" />
              </div>
              <dd class="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ funnel.won_leads }}
              </dd>
            </div>

            <div class="rounded-xl border border-border bg-canvas p-4 transition-colors hover:border-indigo-500/30">
              <div class="flex items-center justify-between text-xs text-muted">
                <dt>{{ t('analytics.totals.proposals', 'Proposals Sent') }}</dt>
                <FileText class="h-4 w-4 text-indigo-500" />
              </div>
              <dd class="mt-2 flex items-baseline justify-between">
                <span class="font-mono text-2xl font-bold text-ink">{{ funnel.proposals.total }}</span>
                <span class="text-xs font-medium text-indigo-500">{{ proposalAcceptRate }}% accepted</span>
              </dd>
            </div>

            <div class="rounded-xl border border-border bg-canvas p-4 transition-colors hover:border-emerald-500/30">
              <div class="flex items-center justify-between text-xs text-muted">
                <dt>{{ t('analytics.totals.contracts', 'Contracts Signed') }}</dt>
                <FileCheck2 class="h-4 w-4 text-emerald-500" />
              </div>
              <dd class="mt-2 flex items-baseline justify-between">
                <span class="font-mono text-2xl font-bold text-ink">{{ funnel.contracts.signed }}</span>
                <span class="text-xs font-medium text-emerald-500">{{ contractSignRate }}% signed</span>
              </dd>
            </div>
          </dl>

          <!-- Document Conversion Progress Bars -->
          <div class="space-y-4 pt-2 border-t border-border">
            <div>
              <div class="flex justify-between text-xs font-medium text-ink">
                <span>Proposal Acceptance Velocity</span>
                <span class="font-mono text-accent">{{ funnel.proposals.accepted }} of {{ funnel.proposals.total }} accepted</span>
              </div>
              <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border/40">
                <div
                  class="h-full rounded-full bg-accent transition-all duration-500"
                  :style="{ width: `${proposalAcceptRate}%` }"
                />
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium text-ink">
                <span>Contract Signing Rate</span>
                <span class="font-mono text-emerald-500">{{ funnel.contracts.signed }} of {{ funnel.contracts.total }} signed</span>
              </div>
              <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border/40">
                <div
                  class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  :style="{ width: `${contractSignRate}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Timestamp Footer -->
          <div v-if="lastRefreshedText" class="flex items-center justify-end gap-1.5 text-[11px] text-muted pt-1">
            <Calendar class="h-3 w-3" />
            <span>Snapshot last computed at {{ lastRefreshedText }}</span>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>
