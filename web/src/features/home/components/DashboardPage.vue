<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { useSummaryQuery } from '@/features/analytics'
import { useAuthStore } from '@/features/auth'
import { BaseButton, ErrorState, LoadingState } from '@/shared/components/base'

const { t } = useI18n()
const auth = useAuthStore()
const { data, isPending, isError, refetch } = useSummaryQuery()

const kpis = computed(() => data.value?.kpis)

const greeting = computed(() => {
  const name = auth.user?.first_name || auth.user?.username
  return name
    ? t('home.dashboard.greetingNamed', { name })
    : t('home.dashboard.greeting')
})

function money(value?: string | number) {
  if (value == null || value === '') return '—'
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numeric)
  }
  return String(value)
}

const pulseItems = computed(() => {
  const snapshot = kpis.value
  if (!snapshot) return []
  return [
    {
      key: 'open',
      label: t('analytics.kpis.openLeads'),
      value: String(snapshot.open_leads ?? '—'),
    },
    {
      key: 'win',
      label: t('analytics.kpis.winRate'),
      value: t('analytics.kpis.winRateValue', { value: snapshot.win_rate ?? 0 }),
    },
    {
      key: 'pipeline',
      label: t('analytics.kpis.pipeline'),
      value: money(snapshot.pipeline_value),
    },
    {
      key: 'projects',
      label: t('analytics.kpis.activeProjects'),
      value: String(snapshot.active_projects ?? '—'),
    },
  ]
})

const flowSteps = ['capture', 'propose', 'deliver'] as const
</script>

<template>
  <div class="dashboard w-full space-y-14">
    <header class="dashboard-hero relative max-w-3xl">
      <p class="text-sm font-medium tracking-[0.18em] text-accent uppercase">
        {{ t('common.nav.dashboard') }}
      </p>
      <h1 class="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-5xl">
        {{ greeting }}
      </h1>
      <p class="mt-4 max-w-xl text-lg text-ink-soft">
        {{ t('home.dashboard.lede') }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink to="/app/leads">
          <BaseButton>{{ t('home.dashboard.ctaLeads') }}</BaseButton>
        </RouterLink>
        <RouterLink to="/app/leads/follow-ups">
          <BaseButton variant="secondary">{{ t('home.dashboard.ctaFollowUps') }}</BaseButton>
        </RouterLink>
      </div>
    </header>

    <section class="dashboard-pulse" aria-labelledby="dashboard-pulse-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="dashboard-pulse-title" class="font-display text-2xl text-ink">
            {{ t('home.dashboard.pulseTitle') }}
          </h2>
          <p class="mt-1 text-sm text-muted">{{ t('home.dashboard.pulseSubtitle') }}</p>
        </div>
        <RouterLink
          class="text-sm font-medium text-accent underline-offset-4 transition hover:underline"
          to="/app/analytics"
        >
          {{ t('home.dashboard.pulseLink') }} →
        </RouterLink>
      </div>

      <LoadingState v-if="isPending" class="mt-6" />
      <ErrorState
        v-else-if="isError"
        class="mt-6"
        :title="t('common.errors.generic')"
        :retry-label="t('common.actions.retry')"
        @retry="refetch()"
      />
      <p v-else-if="!pulseItems.length" class="mt-6 text-sm text-muted">
        {{ t('home.dashboard.pulseEmpty') }}
      </p>
      <div
        v-else
        class="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-soft sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="(item, index) in pulseItems"
          :key="item.key"
          class="pulse-cell bg-canvas-elevated px-5 py-6"
          :style="{ animationDelay: `${index * 70}ms` }"
        >
          <p class="text-xs font-medium tracking-wide text-muted uppercase">{{ item.label }}</p>
          <p class="mt-3 font-display text-3xl tracking-tight text-ink">{{ item.value }}</p>
        </div>
      </div>
    </section>

    <section class="dashboard-guide" aria-labelledby="dashboard-guide-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="max-w-xl">
          <h2 id="dashboard-guide-title" class="font-display text-2xl text-ink">
            {{ t('home.dashboard.guideTitle') }}
          </h2>
          <p class="mt-1 text-sm text-muted">{{ t('home.dashboard.guideSubtitle') }}</p>
        </div>
        <RouterLink to="/app/guide">
          <BaseButton variant="secondary" size="sm">{{ t('home.dashboard.guideCta') }}</BaseButton>
        </RouterLink>
      </div>

      <ol class="mt-8 grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, index) in flowSteps"
          :key="step"
          class="flow-step relative"
          :style="{ animationDelay: `${120 + index * 90}ms` }"
        >
          <p class="font-display text-sm tracking-[0.2em] text-accent uppercase">
            {{ String(index + 1).padStart(2, '0') }}
          </p>
          <h3 class="mt-3 font-display text-xl text-ink">
            {{ t(`home.dashboard.steps.${step}.title`) }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            {{ t(`home.dashboard.steps.${step}.body`) }}
          </p>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.dashboard-hero,
.dashboard-pulse,
.dashboard-guide {
  animation: dash-enter 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.dashboard-pulse {
  animation-delay: 80ms;
}

.dashboard-guide {
  animation-delay: 140ms;
}

.pulse-cell,
.flow-step {
  animation: dash-enter 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes dash-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-hero,
  .dashboard-pulse,
  .dashboard-guide,
  .pulse-cell,
  .flow-step {
    animation: none;
  }
}
</style>
