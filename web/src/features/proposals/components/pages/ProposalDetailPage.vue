<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useProposalDetailData } from '../../composables/detail/useProposalDetailData'
import ProposalDetailHeader from '../detail/ProposalDetailHeader.vue'
import ProposalDetailSummary from '../detail/ProposalDetailSummary.vue'

const route = useRoute()
const proposalId = computed(() => String(route.params.proposalId || route.params.id || ''))

const {
  proposal,
  isPending,
  isError,
  refetch,
  handleCopyShareLink,
} = useProposalDetailData(proposalId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load proposal details"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ProposalDetailHeader
      :proposal="proposal"
      @share="handleCopyShareLink"
    />

    <ProposalDetailSummary :proposal="proposal" />
  </section>
</template>
