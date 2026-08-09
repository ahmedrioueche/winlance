import { computed, ref, type Ref } from 'vue'
import { useClientQuery } from '../../queries'
import type { ClientProject } from '../../types'

export function useClientProjectsData(clientId: Ref<string>) {
  const { data: client, isPending, isError, refetch } = useClientQuery(clientId)

  const searchQuery = ref('')
  const isModalOpen = ref(false)

  const projects = computed<ClientProject[]>(() => client.value?.projects ?? [])

  const filteredProjects = computed(() => {
    return projects.value.filter((p) => {
      const q = searchQuery.value.trim().toLowerCase()
      return !q || p.title.toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q)
    })
  })

  function handleOpenCreateModal() {
    isModalOpen.value = true
  }

  function handleProjectCreated() {
    isModalOpen.value = false
    void refetch()
  }

  return {
    client,
    projects,
    filteredProjects,
    isPending,
    isError,
    refetch,
    searchQuery,
    isModalOpen,
    handleOpenCreateModal,
    handleProjectCreated,
  }
}
