<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink } from 'vue-router'
import {
  Eye,
  FileSignature,
  FilterX,
  Plus,
} from 'lucide-vue-next'

import {
  BaseButton,
  BaseInput,
  BasePageHeader,
  BaseSelect,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import { Pagination } from '@/shared/components/composite'
import { usePagination } from '@/shared/composables/usePagination'
import { useContractsQuery } from '@/features/contracts/queries'
import type { Contract } from '@/features/contracts/types'
import { useClientQuery } from '../../queries'

const { t } = useI18n()
const route = useRoute()
const clientId = computed(() => String(route.params.id || ''))

const clientQuery = useClientQuery(clientId)
const client = computed(() => clientQuery.data.value)

const searchQuery = ref('')
const statusFilter = ref('')

const { page, pageSize, setPage } = usePagination({ defaultPageSize: 5 })

watch([searchQuery, statusFilter], () => {
  setPage(1)
})

const params = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  client_id: clientId.value || undefined,
  q: searchQuery.value.trim() || undefined,
  status: statusFilter.value || undefined,
}))

const contractsQuery = useContractsQuery(params)

const contracts = computed<Contract[]>(() => {
  const data = contractsQuery.data.value
  if (!data) return []
  if ('results' in data && Array.isArray(data.results)) {
    return data.results
  }
  if (Array.isArray(data)) {
    return data
  }
  return []
})

const totalCount = computed(() => {
  const data = contractsQuery.data.value
  if (!data) return 0
  if ('count' in data && typeof data.count === 'number') {
    return data.count
  }
  return contracts.value.length
})

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || statusFilter.value))

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  setPage(1)
}

const statusOptions = computed(() => [
  { value: '', label: t('contracts.allStatuses', 'All Statuses') },
  { value: 'DRAFT', label: t('contracts.status.draft', 'Draft') },
  { value: 'READY', label: t('contracts.status.ready', 'Ready') },
  { value: 'SENT', label: t('contracts.status.sent', 'Sent') },
  { value: 'SIGNED', label: t('contracts.status.signed', 'Signed') },
  { value: 'VOID', label: t('contracts.status.void', 'Void') },
])
</script>

<template>
  <section class="space-y-6">
    <!-- Immediate Header (No skeleton for header) -->
    <BasePageHeader
      :title="t('clients.contracts.title', 'Client Contracts')"
      :subtitle="
        t('clients.contracts.subtitle', {
          name: client?.name || t('clients.settings.thisClient', 'this client'),
        })
      "
    >
      <template #actions>
        <RouterLink to="/app/contracts">
          <BaseButton size="sm">
            <Plus class="h-4 w-4 mr-1.5" />
            <span>{{ t('contracts.newContract', 'New Contract') }}</span>
          </BaseButton>
        </RouterLink>
      </template>
    </BasePageHeader>

    <!-- Immediate Search and Filter Bar -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_12rem_auto]">
      <BaseInput
        v-model="searchQuery"
        label=""
        :placeholder="t('contracts.searchPlaceholder', 'Search contracts by title...')"
      />
      <BaseSelect
        v-model="statusFilter"
        label=""
        :options="statusOptions"
      />
      <BaseButton
        v-if="hasActiveFilters"
        variant="secondary"
        size="md"
        @click="clearFilters"
      >
        <FilterX class="h-4 w-4 mr-1" />
        <span>{{ t('clients.clearFilters', 'Clear Filters') }}</span>
      </BaseButton>
    </div>

    <!-- Content Area: Skeleton for loading state -->
    <div v-if="contractsQuery.isPending.value" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" class="h-20 w-full rounded-2xl" />
    </div>

    <ErrorState
      v-else-if="contractsQuery.isError.value"
      :title="t('common.errors.generic', 'Failed to load contracts')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="contractsQuery.refetch()"
    />

    <template v-else>
      <!-- Empty State -->
      <EmptyState
        v-if="contracts.length === 0"
        :title="
          hasActiveFilters
            ? t('contracts.noMatchingTitle', 'No Contracts Found')
            : t('contracts.emptyTitle', 'No contracts for this client yet')
        "
        :description="
          hasActiveFilters
            ? t('clients.noClientsMatchingFilters', 'No contracts match your current filter criteria.')
            : t('contracts.emptyDescription', 'Create legal agreements and statements of work for this client.')
        "
      >
        <template #action>
          <BaseButton v-if="hasActiveFilters" variant="secondary" size="sm" @click="clearFilters">
            <FilterX class="h-4 w-4 mr-1" />
            <span>{{ t('clients.clearFilters', 'Clear Filters') }}</span>
          </BaseButton>
        </template>
      </EmptyState>

      <!-- Contracts Table View -->
      <div v-else class="rounded-2xl border border-border bg-canvas-elevated shadow-soft overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-border bg-canvas-muted/40 text-muted font-medium">
              <th class="px-4 py-3">{{ t('contracts.table.title', 'Contract Title') }}</th>
              <th class="px-4 py-3">{{ t('contracts.table.status', 'Status') }}</th>
              <th class="px-4 py-3">{{ t('contracts.table.amount', 'Amount') }}</th>
              <th class="px-4 py-3">{{ t('contracts.table.updated', 'Last Updated') }}</th>
              <th class="px-4 py-3 text-end">{{ t('contracts.table.actions', 'Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr
              v-for="contract in contracts"
              :key="contract.id"
              class="group cursor-pointer hover:bg-canvas-muted/70 transition-colors"
              @click="$router.push(`/app/contracts/${contract.id}`)"
            >
              <td class="px-4 py-3 font-semibold text-ink">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shrink-0">
                    <FileSignature class="h-4 w-4" />
                  </div>
                  <span class="truncate max-w-xs group-hover:text-accent transition-colors">
                    {{ contract.title }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                  :class="
                    contract.status === 'SIGNED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : contract.status === 'SENT'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  "
                >
                  {{ contract.status }}
                </span>
              </td>

              <td class="px-4 py-3 font-semibold text-ink">
                ${{ Number(contract.amount || 0).toLocaleString() }} {{ contract.currency }}
              </td>

              <td class="px-4 py-3 text-muted">
                {{ new Date(contract.updated_at || contract.created_at).toLocaleDateString() }}
              </td>

              <td class="px-4 py-3 text-end" @click.stop>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-muted hover:bg-canvas-muted hover:text-accent transition"
                  :title="t('contracts.actions.view', 'View Contract Details')"
                  @click.stop="$router.push(`/app/contracts/${contract.id}`)"
                >
                  <Eye class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (5 contracts per page) -->
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalCount"
        @update:page="setPage"
      />
    </template>
  </section>
</template>
