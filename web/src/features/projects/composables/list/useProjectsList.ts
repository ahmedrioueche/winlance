import { computed, ref } from 'vue'
import { useProjectsQuery } from '../../queries'
import type { Project } from '../../types'

export function useProjectsList() {
  const { data: projectsData, isPending, isError, refetch } = useProjectsQuery({})

  const searchQuery = ref('')
  const statusFilter = ref<string>('')
  const isModalOpen = ref(false)

  const projects = computed<Project[]>(() => {
    if (!projectsData.value) return []
    if ('results' in projectsData.value && Array.isArray(projectsData.value.results)) {
      return projectsData.value.results
    }
    if (Array.isArray(projectsData.value)) {
      return projectsData.value
    }
    return []
  })

  const filteredProjects = computed(() => {
    return projects.value.filter((p) => {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.summary || '').toLowerCase().includes(q) ||
        (p.client_name || '').toLowerCase().includes(q)

      const matchesStatus = !statusFilter.value || p.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
  })

  function handleOpenCreateModal() {
    isModalOpen.value = true
  }

  return {
    projects,
    filteredProjects,
    isPending,
    isError,
    refetch,
    searchQuery,
    statusFilter,
    isModalOpen,
    handleOpenCreateModal,
  }
}
