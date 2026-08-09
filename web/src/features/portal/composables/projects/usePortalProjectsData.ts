import { computed, ref, type Ref } from 'vue'
import { usePortalProposalsQuery } from '../../queries'
import type { Proposal } from '@/features/proposals/types'

export function usePortalProjectsData(token: Ref<string>) {
  const { data: proposals, isPending, isError, refetch } = usePortalProposalsQuery(token)

  const searchQuery = ref('')
  const proposalsList = computed<Proposal[]>(() => proposals.value ?? [])

  const filteredProposals = computed(() => {
    return proposalsList.value.filter((p) => {
      const q = searchQuery.value.trim().toLowerCase()
      return !q || p.title.toLowerCase().includes(q)
    })
  })

  return {
    proposals: proposalsList,
    filteredProposals,
    isPending,
    isError,
    refetch,
    searchQuery,
  }
}
