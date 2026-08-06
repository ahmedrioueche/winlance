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
  return name ? t('home.dashboard.greetingNamed', { name }) : t('home.dashboard.greeting')
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
    <header class="dashboard-hero relative">
      <h1 class="font-display text-ink mt-3 text-4xl leading-[1.05] tracking-tight md:text-5xl">
        {{ greeting }}
      </h1>
      <p class="text-ink-soft mt-4 max-w-xl text-lg">
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
          <h2 id="dashboard-pulse-title" class="font-display text-ink text-2xl">
            {{ t('home.dashboard.pulseTitle') }}
          </h2>
          <p class="text-muted mt-1 text-sm">{{ t('home.dashboard.pulseSubtitle') }}</p>
        </div>
        <RouterLink
          class="text-accent text-sm font-medium underline-offset-4 transition hover:underline"
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
      <p v-else-if="!pulseItems.length" class="text-muted mt-6 text-sm">
        {{ t('home.dashboard.pulseEmpty') }}
      </p>
      <div
        v-else
        class="border-border bg-border shadow-soft mt-6 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="(item, index) in pulseItems"
          :key="item.key"
          class="pulse-cell bg-canvas-elevated px-5 py-6"
          :style="{ animationDelay: `${index * 70}ms` }"
        >
          <p class="text-muted text-xs font-medium tracking-wide uppercase">{{ item.label }}</p>
          <p class="font-display text-ink mt-3 text-3xl tracking-tight">{{ item.value }}</p>
        </div>
      </div>
    </section>

    <section class="dashboard-guide" aria-labelledby="dashboard-guide-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="max-w-xl">
          <h2 id="dashboard-guide-title" class="font-display text-ink text-2xl">
            {{ t('home.dashboard.guideTitle') }}
          </h2>
          <p class="text-muted mt-1 text-sm">{{ t('home.dashboard.guideSubtitle') }}</p>
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
          <p class="font-display text-accent text-sm tracking-[0.2em] uppercase">
            {{ String(index + 1).padStart(2, '0') }}
          </p>
          <h3 class="font-display text-ink mt-3 text-xl">
            {{ t(`home.dashboard.steps.${step}.title`) }}
          </h3>
          <p class="text-ink-soft mt-2 text-sm leading-relaxed">
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
