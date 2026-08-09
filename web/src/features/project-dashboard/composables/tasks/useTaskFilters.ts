import { computed, ref, type Ref } from 'vue'
import type { ProjectTask } from '../../types'

export function useTaskFilters(tasks: Ref<ProjectTask[]>) {
  const searchQuery = ref('')
  const priorityFilter = ref<string>('')
  const statusFilter = ref<string>('')

  const filteredTasks = computed(() => {
    return tasks.value.filter((t) => {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)

      const matchesStatus = !statusFilter.value || t.status === statusFilter.value
      const matchesPriority = !priorityFilter.value || t.priority === priorityFilter.value

      return matchesSearch && matchesStatus && matchesPriority
    })
  })

  const todoTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'TODO'))
  const inProgressTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'IN_PROGRESS'))
  const inReviewTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'IN_REVIEW'))
  const doneTasks = computed(() => filteredTasks.value.filter((t) => t.status === 'DONE'))

  const highUrgentCount = computed(
    () => tasks.value.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length,
  )

  return {
    searchQuery,
    priorityFilter,
    statusFilter,
    filteredTasks,
    todoTasks,
    inProgressTasks,
    inReviewTasks,
    doneTasks,
    highUrgentCount,
  }
}
