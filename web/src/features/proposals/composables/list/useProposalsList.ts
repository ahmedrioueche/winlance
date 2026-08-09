import { computed, ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useDeleteProposalMutation, useProposalsQuery } from '../../queries'
import type { Proposal } from '../../types'

export function useProposalsList() {
  const toast = useToast()
  const { data: proposalsData, isPending, isError, refetch } = useProposalsQuery({})
  const deleteProposalMutation = useDeleteProposalMutation()

  const searchQuery = ref('')
  const statusFilter = ref<string>('')

  const isDeleteModalOpen = ref(false)
  const selectedProposal = ref<Proposal | null>(null)
  const confirmDeleteText = ref('')

  const proposals = computed<Proposal[]>(() => {
    if (!proposalsData.value) return []
    if ('results' in proposalsData.value && Array.isArray(proposalsData.value.results)) {
      return proposalsData.value.results
    }
    if (Array.isArray(proposalsData.value)) {
      return proposalsData.value
    }
    return []
  })

  const filteredProposals = computed(() => {
    return proposals.value.filter((p) => {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesSearch = !q || p.title.toLowerCase().includes(q)
      const matchesStatus = !statusFilter.value || p.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
  })

  function handleOpenDeleteModal(proposal: Proposal) {
    selectedProposal.value = proposal
    confirmDeleteText.value = ''
    isDeleteModalOpen.value = true
  }

  const isDeleteConfirmed = computed(() => {
    return confirmDeleteText.value.trim().toUpperCase() === 'DELETE'
  })

  async function handleConfirmDelete() {
    if (!selectedProposal.value || !isDeleteConfirmed.value) return

    try {
      await deleteProposalMutation.mutateAsync(selectedProposal.value.id)
      isDeleteModalOpen.value = false
      toast.success('proposals.deletedToast', { title: selectedProposal.value.title })
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    proposals,
    filteredProposals,
    isPending,
    isError,
    refetch,
    searchQuery,
    statusFilter,
    isDeleteModalOpen,
    selectedProposal,
    confirmDeleteText,
    isDeleteConfirmed,
    isDeleting: deleteProposalMutation.isPending,
    handleOpenDeleteModal,
    handleConfirmDelete,
  }
}
