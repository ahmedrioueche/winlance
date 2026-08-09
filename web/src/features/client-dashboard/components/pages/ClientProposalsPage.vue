<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useClientProposalsData } from '../../composables/proposals/useClientProposalsData'
import ClientProposalsHeader from '../proposals/ClientProposalsHeader.vue'
import ClientProposalsList from '../proposals/ClientProposalsList.vue'

const route = useRoute()
const clientId = computed(() => String(route.params.id || ''))

const {
  client,
  filteredProposals,
  isPending,
  isError,
  refetch,
  searchQuery,
  handleCreateProposal,
} = useClientProposalsData(clientId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load client proposals"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ClientProposalsHeader
      :client="client"
      @create-proposal="handleCreateProposal"
    />

    <ClientProposalsList
      v-model:search-query="searchQuery"
      :proposals="filteredProposals"
    />
  </section>
</template>
