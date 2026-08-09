import { ref, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useAcceptPortalProposalMutation } from '../../queries'

export function usePortalAcceptanceModal(
  token: Ref<string>,
  proposalId: Ref<string>,
  onSuccessCallback?: () => void,
) {
  const toast = useToast()
  const acceptMutation = useAcceptPortalProposalMutation()

  const signerName = ref('')
  const signerEmail = ref('')
  const signatureDataUrl = ref('')

  async function handleAcceptProposal() {
    if (!token.value || !proposalId.value || !signerName.value.trim()) return

    try {
      await acceptMutation.mutateAsync({
        token: token.value,
        proposalId: proposalId.value,
      })
      toast.success('portal.acceptedToast')
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    signerName,
    signerEmail,
    signatureDataUrl,
    isAccepting: acceptMutation.isPending,
    handleAcceptProposal,
  }
}
