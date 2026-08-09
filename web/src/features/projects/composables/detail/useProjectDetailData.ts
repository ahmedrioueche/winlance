import { computed, type Ref } from 'vue'
import { useProjectQuery } from '../../queries'

export function useProjectDetailData(projectId: Ref<string>) {
  const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

  const budgetFormatted = computed(() => {
    if (!project.value?.budget) return '$0.00 USD'
    return `$${Number(project.value.budget).toLocaleString()} ${project.value.currency || 'USD'}`
  })

  return {
    project,
    isPending,
    isError,
    refetch,
    budgetFormatted,
  }
}
