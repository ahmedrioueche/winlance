import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientQuery } from '../../queries'
import type { ClientProposal } from '../../types'

export function useClientProposalsData(clientId: Ref<string>) {
  const router = useRouter()
  const { data: client, isPending, isError, refetch } = useClientQuery(clientId)

  const searchQuery = ref('')
  const proposals = computed<ClientProposal[]>(() => client.value?.proposals ?? [])

  const filteredProposals = computed(() => {
    return proposals.value.filter((p) => {
      const q = searchQuery.value.trim().toLowerCase()
      return !q || p.title.toLowerCase().includes(q)
    })
  })

  function handleCreateProposal() {
    void router.push(`/app/clients/${clientId.value}/proposals/new`)
  }

  return {
    client,
    proposals,
    filteredProposals,
    isPending,
    isError,
    refetch,
    searchQuery,
    handleCreateProposal,
  }
}
