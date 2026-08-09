<script setup lang="ts">
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useProposalsList } from '../../composables/list/useProposalsList'
import ProposalDeleteModal from '../editor/ProposalDeleteModal.vue'
import ProposalsListFilterBar from '../list/ProposalsListFilterBar.vue'
import ProposalsListHeader from '../list/ProposalsListHeader.vue'
import ProposalsListTable from '../list/ProposalsListTable.vue'

const {
  filteredProposals,
  isPending,
  isError,
  refetch,
  searchQuery,
  statusFilter,
  isDeleteModalOpen,
  selectedProposal,
  confirmDeleteText,
  isDeleteConfirmed,
  isDeleting,
  handleOpenDeleteModal,
  handleConfirmDelete,
} = useProposalsList()
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load proposals list"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ProposalsListHeader />

    <ProposalsListFilterBar
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
    />

    <ProposalsListTable
      :proposals="filteredProposals"
      @delete="handleOpenDeleteModal"
    />

    <!-- Delete Modal -->
    <ProposalDeleteModal
      v-model:confirm-text="confirmDeleteText"
      :open="isDeleteModalOpen"
      :proposal-title="selectedProposal?.title || ''"
      :is-deleting="isDeleting"
      :is-confirmed="isDeleteConfirmed"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>
