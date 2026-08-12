import { computed, ref, type Ref } from 'vue'
import { useProposalExport } from '@/features/proposals/composables/editor/useProposalExport'
import { usePortalProposalQuery } from '../../queries'

export function usePortalProposalView(token: Ref<string>, proposalId: Ref<string>) {
  const { data: proposal, isPending, isError, refetch } = usePortalProposalQuery(token, proposalId)
  const { exportPdf, isExporting: isExportingPdf } = useProposalExport()

  const isAcceptModalOpen = ref(false)
  const isVersionsDrawerOpen = ref(false)

  const isAccepted = computed(() => proposal.value?.status === 'ACCEPTED')

  function handleOpenAcceptModal() {
    isAcceptModalOpen.value = true
  }

  function handleDownloadPdf() {
    if (!proposal.value) return
    void exportPdf({
      title: proposal.value.title || 'Proposal',
      summary: proposal.value.summary || '',
      body: proposal.value.body || '',
      amount: proposal.value.amount,
      currency: proposal.value.currency || 'USD',
      milestones: proposal.value.milestones || [],
      createdAt: proposal.value.created_at,
    })
  }

  return {
    proposal,
    isPending,
    isError,
    refetch,
    isAccepted,
    isAcceptModalOpen,
    isVersionsDrawerOpen,
    isExportingPdf,
    handleOpenAcceptModal,
    handleDownloadPdf,
  }
}
