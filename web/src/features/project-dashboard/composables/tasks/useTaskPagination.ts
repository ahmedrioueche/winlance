import { computed, type Ref } from 'vue'
import { useProjectTasksInfiniteQuery } from '../../queries'
import type { ProjectTask } from '../../types'

export function useTaskPagination(projectId: Ref<string>) {
  const {
    data: infiniteTasksData,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjectTasksInfiniteQuery(projectId, 10)

  const tasks = computed<ProjectTask[]>(() => {
    if (infiniteTasksData.value?.pages) {
      return infiniteTasksData.value.pages.flatMap((page) => page.results)
    }
    return []
  })

  const totalCount = computed(() => infiniteTasksData.value?.pages[0]?.count ?? tasks.value.length)

  const completedCount = computed(() => tasks.value.filter((t) => t.status === 'DONE').length)

  const progressPercent = computed(() => {
    if (!tasks.value.length) return 0
    return Math.round((completedCount.value / tasks.value.length) * 100)
  })

  return {
    tasks,
    totalCount,
    completedCount,
    progressPercent,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}
