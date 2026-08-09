<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FilterX, Plus } from 'lucide-vue-next'
import { BaseButton, EmptyState, ErrorState } from '@/shared/components/base'
import { useClientsList } from '../composables/clients/useClientsList'
import ClientCard from './clients/ClientCard.vue'
import ClientsListFilterBar from './clients/ClientsListFilterBar.vue'
import ClientsListHeader from './clients/ClientsListHeader.vue'
import ClientsSkeleton from './clients/ClientsSkeleton.vue'
import CreateClientModal from './clients/CreateClientModal.vue'

const { t } = useI18n()

const {
  filteredClients,
  isPending,
  isError,
  refetch,
  searchQuery,
  statusFilter,
  dateFilter,
  startDate,
  endDate,
  sortBy,
  hasActiveFilters,
  activeFiltersCount,
  clearFilters,
  isModalOpen,
  name,
  companyName,
  email,
  phone,
  notes,
  isSaving,
  handleOpenCreateModal,
  handleSaveClient,
} = useClientsList()

const emptyTitle = computed(() => {
  if (hasActiveFilters.value) {
    return t('clients.noClientsFoundTitle', 'No Clients Found')
  }
  return t('clients.empty', 'No clients found')
})

const emptyDescription = computed(() => {
  if (hasActiveFilters.value) {
    return t(
      'clients.noClientsMatchingFilters',
      'No clients match your current filter criteria. Try resetting filters.',
    )
  }
  return t('clients.emptyDescription', 'Get started by creating your first client.')
})
</script>

<template>
  <ClientsSkeleton v-if="isPending" />

  <ErrorState
    v-else-if="isError"
    title="Failed to load clients"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ClientsListHeader @create-client="handleOpenCreateModal" />

    <ClientsListFilterBar
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:date-filter="dateFilter"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      v-model:sort-by="sortBy"
      :has-active-filters="hasActiveFilters"
      :active-filters-count="activeFiltersCount"
      @clear-filters="clearFilters"
    />

    <!-- Empty State -->
    <EmptyState
      v-if="filteredClients.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
    >
      <template #action>
        <BaseButton
          v-if="hasActiveFilters"
          variant="secondary"
          size="sm"
          @click="clearFilters"
        >
          <FilterX class="h-4 w-4" />
          <span>{{ t('clients.clearFilters', 'Clear Filters') }}</span>
        </BaseButton>

        <BaseButton
          v-else
          size="sm"
          @click="handleOpenCreateModal"
        >
          <Plus class="h-4 w-4" />
          <span>{{ t('clients.create', 'New Client') }}</span>
        </BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <ClientCard
        v-for="client in filteredClients"
        :key="client.id"
        :client="client"
      />
    </div>

    <!-- Create Client Modal -->
    <CreateClientModal
      v-model:name="name"
      v-model:company-name="companyName"
      v-model:email="email"
      v-model:phone="phone"
      v-model:notes="notes"
      :open="isModalOpen"
      :is-saving="isSaving"
      @close="isModalOpen = false"
      @save="handleSaveClient"
    />
  </section>
</template>
