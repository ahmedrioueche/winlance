import { ref, watch, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useProposalQuery, useUpdateProposalMutation } from '../../queries'

export function useProposalEditorState(proposalId: Ref<string>) {
  const toast = useToast()
  const { data: proposal, isPending, isError, refetch } = useProposalQuery(proposalId)
  const updateProposalMutation = useUpdateProposalMutation()

  const title = ref('')
  const summary = ref('')
  const body = ref('')
  const amount = ref<number | string>(0)
  const currency = ref('USD')
  const status = ref('DRAFT')
  const targetProjectName = ref('')

  watch(
    proposal,
    (p) => {
      if (p) {
        title.value = p.title || ''
        summary.value = p.summary || ''
        body.value = p.body || ''
        amount.value = p.amount != null ? p.amount : 0
        currency.value = p.currency || 'USD'
        status.value = p.status || 'DRAFT'
        targetProjectName.value = p.target_project_name || ''
      }
    },
    { immediate: true },
  )

  async function handleSaveProposal() {
    if (!proposalId.value || !title.value.trim()) return

    try {
      await updateProposalMutation.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        summary: summary.value.trim(),
        body: body.value,
        amount: amount.value ? Number(amount.value) : 0,
        currency: currency.value,
        status: status.value,
        target_project_name: targetProjectName.value.trim(),
      })
      toast.success('proposals.savedToast')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handlePublishProposal() {
    status.value = 'SENT'
    await handleSaveProposal()
    toast.success('proposals.publishedToast')
  }

  return {
    proposal,
    isPending,
    isError,
    refetch,
    title,
    summary,
    body,
    amount,
    currency,
    status,
    targetProjectName,
    isSaving: updateProposalMutation.isPending,
    handleSaveProposal,
    handlePublishProposal,
  }
}
