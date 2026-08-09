import { computed, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useProposalQuery } from '../../queries'

export function useProposalDetailData(proposalId: Ref<string>) {
  const toast = useToast()
  const { data: proposal, isPending, isError, refetch } = useProposalQuery(proposalId)

  function handleCopyShareLink() {
    const shareUrl = `${window.location.origin}/portal/proposal/${proposalId.value}`
    void navigator.clipboard.writeText(shareUrl)
    toast.success('Shareable client portal proposal link copied to clipboard!')
  }

  const isAccepted = computed(() => proposal.value?.status === 'ACCEPTED')

  return {
    proposal,
    isPending,
    isError,
    refetch,
    isAccepted,
    handleCopyShareLink,
  }
}
