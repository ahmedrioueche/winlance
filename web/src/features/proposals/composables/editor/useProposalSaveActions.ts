import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import { useCreateProjectFromProposalMutation, useDeleteProposalMutation } from '../../queries'

export function useProposalSaveActions(proposalId: Ref<string>, clientId?: Ref<string>) {
  const router = useRouter()
  const toast = useToast()

  const deleteProposalMutation = useDeleteProposalMutation()
  const createProjectMutation = useCreateProjectFromProposalMutation()

  const isDeleteModalOpen = ref(false)
  const confirmDeleteText = ref('')

  function handleOpenDeleteModal() {
    confirmDeleteText.value = ''
    isDeleteModalOpen.value = true
  }

  const isDeleteConfirmed = computed(() => {
    return confirmDeleteText.value.trim().toUpperCase() === 'DELETE'
  })

  async function handleConfirmDeleteProposal(proposalTitle: string) {
    if (!isDeleteConfirmed.value || !proposalId.value) return

    try {
      await deleteProposalMutation.mutateAsync(proposalId.value)
      isDeleteModalOpen.value = false
      toast.success('proposals.deletedToast', { title: proposalTitle })

      if (clientId?.value) {
        void router.push(`/app/clients/${clientId.value}/proposals`)
      } else {
        void router.push('/app/proposals')
      }
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleCreateProjectWorkspace() {
    if (!proposalId.value) return

    try {
      const res = await createProjectMutation.mutateAsync(proposalId.value)
      toast.success('Project workspace and task list created!')
      void router.push(`/app/projects/${res.project_id}/overview`)
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    isDeleteModalOpen,
    confirmDeleteText,
    isDeleteConfirmed,
    isDeleting: deleteProposalMutation.isPending,
    isCreatingProject: createProjectMutation.isPending,
    handleOpenDeleteModal,
    handleConfirmDeleteProposal,
    handleCreateProjectWorkspace,
  }
}
