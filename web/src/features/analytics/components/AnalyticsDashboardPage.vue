<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'

import { useFunnelQuery, useSummaryQuery } from '../queries'
import FunnelBars from './FunnelBars.vue'
import KpiCard from './KpiCard.vue'
import Sparkline from './Sparkline.vue'

const { t } = useI18n()
const funnelQuery = useFunnelQuery()
const summaryQuery = useSummaryQuery()

const funnel = computed(() => funnelQuery.data.value)
const summary = computed(() => summaryQuery.data.value)
const kpis = computed(() => summary.value?.kpis)

const stageSpark = computed(() => (funnel.value?.stages ?? []).map((stage) => stage.count))
const conversionSpark = computed(() =>
  Object.values(funnel.value?.conversions ?? {}).map((value) => Number(value) || 0),
)

const pending = computed(() => funnelQuery.isPending.value || summaryQuery.isPending.value)
const errored = computed(() => funnelQuery.isError.value || summaryQuery.isError.value)

function retry() {
  void funnelQuery.refetch()
  void summaryQuery.refetch()
}

function money(value?: string | number) {
  if (value == null || value === '') return '—'
  return String(value)
}
</script>

<template>
  <section class="w-full space-y-8">
    <header>
      <h1 class="font-display text-3xl text-ink">{{ t('analytics.title') }}</h1>
      <p class="mt-2 text-muted">{{ t('analytics.subtitle') }}</p>
    </header>

    <LoadingState v-if="pending" />
    <ErrorState
      v-else-if="errored"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="retry"
    />
    <EmptyState
      v-else-if="!funnel || !kpis"
      :title="t('analytics.empty')"
    />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          :label="t('analytics.kpis.openLeads')"
          :value="kpis.open_leads"
        />
        <KpiCard
          :label="t('analytics.kpis.winRate')"
          :value="t('analytics.kpis.winRateValue', { value: kpis.win_rate })"
        />
        <KpiCard
          :label="t('analytics.kpis.pipeline')"
          :value="money(kpis.pipeline_value)"
        />
        <KpiCard
          :label="t('analytics.kpis.wonValue')"
          :value="money(kpis.won_value)"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <KpiCard
          :label="t('analytics.kpis.proposalsSent')"
          :value="kpis.proposals_sent"
        />
        <KpiCard
          :label="t('analytics.kpis.contractsSigned')"
          :value="kpis.contracts_signed"
        />
        <KpiCard
          :label="t('analytics.kpis.activeProjects')"
          :value="kpis.active_projects"
        />
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
          <div class="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 class="font-display text-xl text-ink">{{ t('analytics.funnel') }}</h2>
              <p class="text-sm text-muted">{{ t('analytics.funnelHint') }}</p>
            </div>
            <div class="w-28">
              <Sparkline :values="stageSpark" :label="t('analytics.stageSpark')" />
            </div>
          </div>
          <FunnelBars :stages="funnel.stages" />
        </section>

        <section class="space-y-4 rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
          <div>
            <h2 class="font-display text-xl text-ink">{{ t('analytics.summary') }}</h2>
            <p class="text-sm text-muted">{{ t('analytics.summaryHint') }}</p>
          </div>
          <Sparkline :values="conversionSpark" :label="t('analytics.conversionSpark')" />
          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-border bg-canvas px-3 py-2">
              <dt class="text-xs text-muted">{{ t('analytics.totals.leads') }}</dt>
              <dd class="text-lg text-ink">{{ funnel.total_leads }}</dd>
            </div>
            <div class="rounded-lg border border-border bg-canvas px-3 py-2">
              <dt class="text-xs text-muted">{{ t('analytics.totals.won') }}</dt>
              <dd class="text-lg text-ink">{{ funnel.won_leads }}</dd>
            </div>
            <div class="rounded-lg border border-border bg-canvas px-3 py-2">
              <dt class="text-xs text-muted">{{ t('analytics.totals.proposals') }}</dt>
              <dd class="text-lg text-ink">{{ funnel.proposals.total }}</dd>
            </div>
            <div class="rounded-lg border border-border bg-canvas px-3 py-2">
              <dt class="text-xs text-muted">{{ t('analytics.totals.contracts') }}</dt>
              <dd class="text-lg text-ink">{{ funnel.contracts.total }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </section>
</template>
