<script setup lang="ts">
import {
  ArrowRight,
  CreditCard,
  FileText,
  Plus,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { BaseButton, BaseInput, BaseSelect, EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { useToast } from '@/shared/toast/useToast'

import { useClientQuery } from '@/features/client-dashboard/queries'
import { useCreateProposalMutation, useProposalsQuery } from '@/features/proposals/queries'
import type { Proposal } from '@/features/proposals/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const clientId = computed(() => String(route.params.id || ''))
const { data: client } = useClientQuery(clientId)

const createProposal = useCreateProposalMutation()

// Search & Filter state
const searchQuery = ref('')
const selectedStatus = ref('')

const listParams = computed(() => ({ page: 1, page_size: 50 }))
const { data: proposalsData, isPending, isError, refetch } = useProposalsQuery(listParams)

const rawProposals = computed<Proposal[]>(() => proposalsData.value?.results ?? [])

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('proposals.allStatuses', 'All Statuses') },
  { value: 'DRAFT', label: t('proposals.status.draft', 'Draft') },
  { value: 'READY', label: t('proposals.status.ready', 'Ready') },
  { value: 'SENT', label: t('proposals.status.sent', 'Sent') },
  { value: 'UNDER_REVIEW', label: t('proposals.status.under_review', 'Under Review') },
  { value: 'CHANGES_REQUESTED', label: t('proposals.status.changes_requested', 'Changes Requested') },
  { value: 'ACCEPTED', label: t('proposals.status.accepted', 'Accepted') },
  { value: 'REJECTED', label: t('proposals.status.rejected', 'Rejected') },
  { value: 'EXPIRED', label: t('proposals.status.expired', 'Expired') },
  { value: 'WITHDRAWN', label: t('proposals.status.withdrawn', 'Withdrawn') },
])

const filteredProposals = computed(() => {
  return rawProposals.value.filter((proposal) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      proposal.title.toLowerCase().includes(q) ||
      (proposal.summary && proposal.summary.toLowerCase().includes(q))

    const matchesStatus =
      !selectedStatus.value || proposal.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

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

async function handleCreateProposal() {
  try {
    const newTitle = client.value?.name ? `Proposal for ${client.value.name}` : 'New Proposal'
    const created = await createProposal.mutateAsync({
      title: newTitle,
      amount: 0,
      currency: 'USD',
      status: 'DRAFT',
      summary: `Proposal scope and estimate for ${client.value?.name || 'client'}.`,
    })

    toast.success(t('proposals.createdSuccess', 'Proposal created. Opening document editor...'))
    await router.push(`/app/clients/${clientId.value}/proposals/${created.id}`)
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-6">
    <!-- Header Row -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {{ client?.name ? `${client.name} Proposals` : t('proposals.title', 'Proposals') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Manage scope estimates, proposals, and client document versions for {{ client?.name || 'this client' }}
        </p>
      </div>

      <BaseButton class="shrink-0" :loading="createProposal.isPending.value" @click="handleCreateProposal">
        <Plus class="h-4 w-4" />
        <span>{{ t('proposals.create', 'New Proposal') }}</span>
      </BaseButton>
    </div>

    <!-- Search & Filter Bar -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-12 items-start">
      <!-- Search Input -->
      <div class="sm:col-span-8 lg:col-span-9">
        <BaseInput
          v-model="searchQuery"
          :label="t('proposals.searchPlaceholder', 'Search proposals...')"
          :placeholder="t('proposals.searchPlaceholder', 'Search by title or summary...')"
        />
      </div>

      <!-- Status Filter -->
      <div class="sm:col-span-4 lg:col-span-3">
        <BaseSelect
          v-model="selectedStatus"
          :label="t('proposals.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>
    </div>

    <!-- View States -->
    <!-- Loading State -->
    <div v-if="isPending" class="space-y-4">
      <Skeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :title="t('common.errors.generic', 'Failed to load proposals')"
      :message="t('common.errors.network', 'Please check your connection and try again.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredProposals.length === 0"
      class="mt-6"
      :title="t('proposals.empty', 'No proposals found')"
      :description="t('proposals.emptyDescription', 'Create your first proposal to send scope estimates and draft legal terms.')"
    >
      <template #action>
        <BaseButton :loading="createProposal.isPending.value" @click="handleCreateProposal">
          <Plus class="h-4 w-4" />
          <span>{{ t('proposals.create', 'New Proposal') }}</span>
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Proposals List Cards Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="item in filteredProposals"
        :key="item.id"
        :to="`/app/clients/${clientId}/proposals/${item.id}`"
        class="group relative flex flex-col justify-between rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
      >
        <div class="space-y-3">
          <!-- Top Row: Icon, Status Badge -->
          <div class="flex items-center justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <FileText class="h-5 w-5" />
            </div>
            <span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider" :class="getStatusBadgeClass(item.status)">
              {{ item.status.replace('_', ' ') }}
            </span>
          </div>

          <!-- Proposal Title & Summary -->
          <div>
            <h3 class="font-display text-base font-semibold text-ink transition-colors group-hover:text-accent line-clamp-1">
              {{ item.title || 'Untitled Proposal' }}
            </h3>
            <p v-if="item.summary" class="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
              {{ item.summary }}
            </p>
          </div>
        </div>

        <!-- Bottom Row: Financial Estimate & Open Document CTA -->
        <div class="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 font-bold text-ink">
            <CreditCard class="h-3.5 w-3.5 text-muted" />
            <span>${{ Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ item.currency || 'USD' }}</span>
          </div>

          <div class="flex items-center gap-1 font-semibold text-accent group-hover:underline">
            <span>Edit Document</span>
            <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
