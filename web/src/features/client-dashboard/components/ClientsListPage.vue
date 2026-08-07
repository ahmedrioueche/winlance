<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput, BaseSelect, EmptyState, ErrorState } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import Pagination from '@/shared/components/composite/Pagination.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { openCreateClientModal } from '@/shared/modal/registry'

import { useClientsQuery } from '../queries'
import type { Client } from '../types'
import ClientCard from './ClientCard.vue'
import ClientsSkeleton from './ClientsSkeleton.vue'

const { t } = useI18n()

// Pagination composable
const { page, pageSize, setPage } = usePagination({
  defaultPage: 1,
  defaultPageSize: 9,
  syncToQuery: true,
})

// Search & Filter state
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedDateFilter = ref('')

// Query clients
const { data, isPending, isError, refetch } = useClientsQuery(
  computed(() => ({
    page: page.value,
    page_size: pageSize.value,
  })),
)

// Raw results from backend
const rawClients = computed<Client[]>(() => data.value?.results ?? [])
const totalCount = computed(() => data.value?.count ?? 0)

// Date Added Filter Options
const dateOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('clients.dateFilter.allTime', 'All Time') },
  { value: 'today', label: t('clients.dateFilter.today', 'Today') },
  { value: '7days', label: t('clients.dateFilter.last7Days', 'Last 7 Days') },
  { value: '30days', label: t('clients.dateFilter.last30Days', 'Last 30 Days') },
  { value: 'thisYear', label: t('clients.dateFilter.thisYear', 'This Year') },
])

// Status Filter Options
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('clients.allStatuses', 'All Statuses') },
  { value: 'ACTIVE', label: t('clients.status.active', 'Active') },
  { value: 'LEAD', label: t('clients.status.lead', 'Lead') },
  { value: 'PROPOSAL_SENT', label: t('clients.status.proposal_sent', 'Proposal Sent') },
  { value: 'NEGOTIATING', label: t('clients.status.negotiating', 'Negotiating') },
  { value: 'COMPLETED', label: t('clients.status.completed', 'Completed') },
  { value: 'ARCHIVED', label: t('clients.status.archived', 'Archived') },
])

// Filtered Clients
const filteredClients = computed(() => {
  const now = new Date()

  return rawClients.value.filter((client) => {
    // Search match
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      client.name.toLowerCase().includes(q) ||
      (client.company_name && client.company_name.toLowerCase().includes(q)) ||
      (client.email && client.email.toLowerCase().includes(q)) ||
      (client.location && client.location.toLowerCase().includes(q)) ||
      (client.industry && client.industry.toLowerCase().includes(q))

    // Status match
    const matchesStatus =
      !selectedStatus.value || client.status === selectedStatus.value

    // Date Added match
    let matchesDate = true
    if (selectedDateFilter.value && client.created_at) {
      const clientDate = new Date(client.created_at)
      if (selectedDateFilter.value === 'today') {
        matchesDate = clientDate.toDateString() === now.toDateString()
      } else if (selectedDateFilter.value === '7days') {
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        matchesDate = clientDate >= sevenDaysAgo
      } else if (selectedDateFilter.value === '30days') {
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)
        matchesDate = clientDate >= thirtyDaysAgo
      } else if (selectedDateFilter.value === 'thisYear') {
        matchesDate = clientDate.getFullYear() === now.getFullYear()
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })
})

// Reset to page 1 on search or filter change
watch([searchQuery, selectedStatus, selectedDateFilter], () => {
  setPage(1)
})

function handleOpenCreateModal() {
  openCreateClientModal({
    onCreated: () => {
      refetch()
    },
  })
}
</script>

<template>
  <section class="w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
          {{ t('clients.title', 'Clients') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('clients.subtitle', 'Manage all client relationships, contacts, and engagements') }}
        </p>
      </div>

      <BaseButton class="shrink-0" @click="handleOpenCreateModal">
        <span aria-hidden="true">+</span>
        {{ t('clients.create', 'New Client') }}
      </BaseButton>
    </div>

    <!-- Search & Filter Controls -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-12 items-start">
      <!-- Search Input -->
      <div class="sm:col-span-6 lg:col-span-6">
        <BaseInput
          v-model="searchQuery"
          :label="t('clients.searchPlaceholder', 'Search clients...')"
          :placeholder="t('clients.searchPlaceholder', 'Search clients by name, company, email, location...')"
        />
      </div>

      <!-- Status Filter -->
      <div class="sm:col-span-3 lg:col-span-3">
        <BaseSelect
          v-model="selectedStatus"
          :label="t('clients.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>

      <!-- Date Added Filter -->
      <div class="sm:col-span-3 lg:col-span-3">
        <BaseSelect
          v-model="selectedDateFilter"
          :label="t('clients.filterByDateAdded', 'Filter by date added')"
          :options="dateOptions"
        />
      </div>
    </div>

    <!-- View States -->
    <!-- Loading State -->
    <ClientsSkeleton v-if="isPending" class="mt-6" />

    <!-- Error State -->
    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :title="t('common.errors.generic', 'Failed to load clients')"
      :message="t('common.errors.network', 'Please check your connection and try again.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredClients.length === 0"
      class="mt-6"
      :title="t('clients.empty', 'No clients found')"
      :description="t('clients.emptyDescription', 'Get started by creating your first client.')"
    >
      <template #action>
        <BaseButton @click="handleOpenCreateModal">
          {{ t('clients.create', 'New Client') }}
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Success State: Cards Grid -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ClientCard
          v-for="client in filteredClients"
          :key="client.id"
          :client="client"
        />
      </div>

      <!-- Reusable Pagination (auto-hides when single page) -->
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalCount"
        :disabled="isPending"
        @update:page="setPage"
      />
    </div>
  </section>
</template>
