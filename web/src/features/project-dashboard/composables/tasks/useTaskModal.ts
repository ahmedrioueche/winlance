import { computed, ref, type Ref } from 'vue'
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../queries'
import type { ProjectTask, TaskPriority, TaskStatus } from '../../types'

export function useTaskModal(
  projectId: Ref<string>,
  tasksCount: Ref<number>,
  onSuccess: (message: string) => void,
  onError: (error: unknown) => void,
) {
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()

  const isModalOpen = ref(false)
  const editingTask = ref<ProjectTask | null>(null)
  const taskTitle = ref('')
  const taskDescription = ref('')
  const taskMilestoneId = ref('')
  const taskStatus = ref<TaskStatus>('TODO')
  const taskPriority = ref<TaskPriority>('MEDIUM')
  const taskDueDate = ref('')

  function handleOpenCreateModal(defaultMilestoneId?: string) {
    editingTask.value = null
    taskTitle.value = ''
    taskDescription.value = ''
    taskMilestoneId.value = defaultMilestoneId || ''
    taskStatus.value = 'TODO'
    taskPriority.value = 'MEDIUM'
    taskDueDate.value = ''
    isModalOpen.value = true
  }

  function handleOpenEditModal(task: ProjectTask) {
    editingTask.value = task
    taskTitle.value = task.title
    taskDescription.value = task.description || ''
    taskMilestoneId.value = task.milestone || task.milestone_id || ''
    taskStatus.value = task.status
    taskPriority.value = task.priority
    taskDueDate.value = task.due_date || ''
    isModalOpen.value = true
  }

  async function handleSaveTask() {
    if (!projectId.value || !taskTitle.value.trim()) return

    try {
      if (editingTask.value) {
        await updateTaskMutation.mutateAsync({
          projectId: projectId.value,
          taskId: editingTask.value.id,
          payload: {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            milestone: taskMilestoneId.value || null,
            status: taskStatus.value,
            priority: taskPriority.value,
            due_date: taskDueDate.value || null,
          },
        })
        onSuccess('Task updated successfully!')
      } else {
        await createTaskMutation.mutateAsync({
          projectId: projectId.value,
          payload: {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            milestone: taskMilestoneId.value || null,
            status: taskStatus.value,
            priority: taskPriority.value,
            due_date: taskDueDate.value || null,
            order: tasksCount.value + 1,
          },
        })
        onSuccess('Task created successfully!')
      }

      isModalOpen.value = false
    } catch (error) {
      onError(error)
    }
  }

  return {
    isModalOpen,
    editingTask,
    taskTitle,
    taskDescription,
    taskMilestoneId,
    taskStatus,
    taskPriority,
    taskDueDate,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveTask,
    isSubmitting: computed(() => createTaskMutation.isPending.value || updateTaskMutation.isPending.value),
  }
}
