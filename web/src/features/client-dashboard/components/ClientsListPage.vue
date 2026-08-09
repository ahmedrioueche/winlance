<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ErrorState } from '@/shared/components/base'
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
    />

    <div v-if="filteredClients.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
      {{ t('clients.noClientsFound') }}
    </div>

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
