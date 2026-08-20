<script setup lang="ts">
import { ErrorState, Skeleton } from '@/shared/components/base'
import { Pagination } from '@/shared/components/composite'
import { useProposalsList } from '../../composables/list/useProposalsList'
import ProposalDeleteModal from '../editor/ProposalDeleteModal.vue'
import ProposalsListFilterBar from '../list/ProposalsListFilterBar.vue'
import ProposalsListHeader from '../list/ProposalsListHeader.vue'
import ProposalsListTable from '../list/ProposalsListTable.vue'

const {
  filteredProposals,
  totalCount,
  page,
  pageSize,
  setPage,
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
  <section class="space-y-6">
    <ProposalsListHeader />

    <ProposalsListFilterBar
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
    />

    <div v-if="isPending" class="py-4">
      <Skeleton class="h-96 w-full rounded-2xl" />
    </div>

    <ErrorState
      v-else-if="isError"
      title="Failed to load proposals list"
      retry-label="Try again"
      @retry="refetch()"
    />

    <template v-else>
      <ProposalsListTable
        :proposals="filteredProposals"
        @delete="handleOpenDeleteModal"
      />

      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalCount"
        @update:page="setPage"
      />
    </template>

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
