<script setup lang="ts">
import {
  ArrowRight,
  CreditCard,
  FileText,
} from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { EmptyState, ErrorState, Skeleton } from '@/shared/components/base'

import { usePortalInfoQuery, usePortalProposalsQuery } from '../../queries'
import type { Proposal } from '../../types'

const { t } = useI18n()
const route = useRoute()
const token = computed(() => String(route.params.token || ''))

const { data: portalInfo } = usePortalInfoQuery(token)
const { data: proposals, isPending, isError, refetch } = usePortalProposalsQuery(token)

const proposalList = computed<Proposal[]>(() => proposals.value ?? [])

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'SENT':
    case 'READY':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case 'UNDER_REVIEW':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'CHANGES_REQUESTED':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'REJECTED':
    case 'EXPIRED':
    case 'WITHDRAWN':
      return 'bg-error-soft text-error border-error/30'
    case 'DRAFT':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
}
</script>

<template>
  <section class="space-y-6">
    <!-- Section Header -->
    <div>
      <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
        {{ t('portal.proposals.title', 'Proposals & Scope Offers') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('portal.proposals.subtitle', { client: portalInfo?.company_name || portalInfo?.client_name || 'you' }) }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" class="h-44 w-full rounded-xl" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="isError"
      :title="t('portal.errors.loadProposalFailed', 'Failed to load proposals')"
      :message="t('common.errors.network', 'Could not load proposals for this portal.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="proposalList.length === 0"
      :title="t('portal.proposals.emptyTitle', 'No proposals published yet')"
      :description="t('portal.proposals.emptyMessage', 'Your freelancer has not published any proposals for review yet.')"
    />

    <!-- Proposals Cards Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="item in proposalList"
        :key="item.id"
        :to="`/portal/${token}/proposals/${item.id}`"
        class="group relative flex flex-col justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
      >
        <div class="space-y-4">
          <!-- Status Badge & Icon -->
          <div class="flex items-center justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <FileText class="h-5 w-5" />
            </div>

            <span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider" :class="getStatusBadgeClass(item.status)">
              {{ item.status.replace('_', ' ') }}
            </span>
          </div>

          <!-- Proposal Title -->
          <div>
            <h3 class="font-display text-base font-bold text-ink transition-colors group-hover:text-accent line-clamp-1">
              {{ item.title || t('proposals.editor.untitled', 'Untitled Proposal') }}
            </h3>
            <p v-if="item.summary" class="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
              {{ item.summary }}
            </p>
          </div>
        </div>

        <!-- Financial Estimate & Open CTA -->
        <div class="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 font-bold text-ink">
            <CreditCard class="h-3.5 w-3.5 text-muted" />
            <span>${{ Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ item.currency || 'USD' }}</span>
          </div>

          <div class="flex items-center gap-1 font-semibold text-accent group-hover:underline">
            <span>{{ t('portal.proposals.viewButton', 'Review Offer') }}</span>
            <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
