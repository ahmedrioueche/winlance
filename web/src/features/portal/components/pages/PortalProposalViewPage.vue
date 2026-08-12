<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { usePortalProposalView } from '../../composables/proposals/usePortalProposalView'
import { usePortalAcceptanceModal } from '../../composables/proposals/usePortalAcceptanceModal'
import PortalProposalAcceptanceModal from '../proposals/PortalProposalAcceptanceModal.vue'
import PortalProposalDocumentView from '../proposals/PortalProposalDocumentView.vue'
import PortalProposalStickyBar from '../proposals/PortalProposalStickyBar.vue'
import PortalProposalViewHeader from '../proposals/PortalProposalViewHeader.vue'

const route = useRoute()
const token = computed(() => String(route.params.token || ''))
const proposalId = computed(() => String(route.params.id || route.params.proposalId || ''))

const {
  proposal,
  isPending,
  isError,
  refetch,
  isAccepted,
  isAcceptModalOpen,
  isExportingPdf,
  handleOpenAcceptModal,
  handleDownloadPdf,
} = usePortalProposalView(token, proposalId)

const {
  signerName,
  signerEmail,
  isAccepting,
  handleAcceptProposal,
} = usePortalAcceptanceModal(token, proposalId, () => {
  isAcceptModalOpen.value = false
  void refetch()
})
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load client portal proposal"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6 pb-16">
    <!-- Header -->
    <PortalProposalViewHeader
      :proposal="proposal"
      :is-accepted="isAccepted"
      :is-exporting-pdf="isExportingPdf"
      @sign-proposal="handleOpenAcceptModal"
      @download-pdf="handleDownloadPdf"
    />

    <!-- Unified Executive Document Flow -->
    <PortalProposalDocumentView
      :proposal="proposal"
      :is-accepted="isAccepted"
      @sign-proposal="handleOpenAcceptModal"
    />

    <!-- Floating Sticky Quick-Accept Bar -->
    <PortalProposalStickyBar
      :proposal="proposal"
      :is-accepted="isAccepted"
      @sign-proposal="handleOpenAcceptModal"
    />

    <!-- Acceptance Modal -->
    <PortalProposalAcceptanceModal
      v-model:signer-name="signerName"
      v-model:signer-email="signerEmail"
      :open="isAcceptModalOpen"
      :is-accepting="isAccepting"
      @close="isAcceptModalOpen = false"
      @accept="handleAcceptProposal"
    />
  </section>
</template>
