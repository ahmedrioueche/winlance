import { computed, ref, type Ref } from 'vue'
import { usePortalProposalQuery } from '../../queries'

export function usePortalProposalView(token: Ref<string>, proposalId: Ref<string>) {
  const { data: proposal, isPending, isError, refetch } = usePortalProposalQuery(token, proposalId)

  const isAcceptModalOpen = ref(false)
  const isVersionsDrawerOpen = ref(false)

  const isAccepted = computed(() => proposal.value?.status === 'ACCEPTED')

  function handleOpenAcceptModal() {
    isAcceptModalOpen.value = true
  }

  function handleDownloadPdf() {
    window.print()
  }

  return {
    proposal,
    isPending,
    isError,
    refetch,
    isAccepted,
    isAcceptModalOpen,
    isVersionsDrawerOpen,
    handleOpenAcceptModal,
    handleDownloadPdf,
  }
}
