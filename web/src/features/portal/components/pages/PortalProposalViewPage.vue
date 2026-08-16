<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import { usePortalProposalView } from '../../composables/proposals/usePortalProposalView'
import { usePortalAcceptanceModal } from '../../composables/proposals/usePortalAcceptanceModal'
import { useSuggestPortalEditsMutation } from '../../queries'
import PortalProposalAcceptanceModal from '../proposals/PortalProposalAcceptanceModal.vue'
import PortalProposalDocumentView from '../proposals/PortalProposalDocumentView.vue'
import PortalProposalStickyBar from '../proposals/PortalProposalStickyBar.vue'
import PortalProposalViewHeader from '../proposals/PortalProposalViewHeader.vue'

const route = useRoute()
const toast = useToast()
const token = computed(() => String(route.params.token || ''))
const proposalId = computed(() => String(route.params.id || route.params.proposalId || ''))
const selectedAddonIds = ref<string[]>([])

const suggestEditsMutation = useSuggestPortalEditsMutation()

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

async function handleRequestChanges(feedbackNotes: string) {
  if (!token.value || !proposalId.value) return
  try {
    await suggestEditsMutation.mutateAsync({
      token: token.value,
      proposalId: proposalId.value,
      payload: {
        change_summary: feedbackNotes,
        feedback_notes: feedbackNotes,
      },
    })
    toast.success('Revision request submitted successfully!')
    void refetch()
  } catch (err) {
    toast.errorFromUnknown(err)
  }
}
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
      v-model:selected-addon-ids="selectedAddonIds"
      :proposal="proposal"
      :is-accepted="isAccepted"
      @sign-proposal="handleOpenAcceptModal"
      @request-changes="handleRequestChanges"
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
      @accept="handleAcceptProposal(selectedAddonIds)"
    />
  </section>
</template>
