import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/shared/toast/useToast'
import { useCreateTaskMutation, useDeleteTaskMutation } from '../../queries'
import type { ProjectTask } from '../../types'

export function useTaskDeletion(projectId: Ref<string>) {
  const { t } = useI18n()
  const toast = useToast()
  const deleteTaskMutation = useDeleteTaskMutation()
  const createTaskMutation = useCreateTaskMutation()

  const isDeleteModalOpen = ref(false)
  const taskToDelete = ref<ProjectTask | null>(null)

  function handlePromptDeleteTask(task: ProjectTask) {
    taskToDelete.value = task
    isDeleteModalOpen.value = true
  }

  async function handleConfirmDeleteTask() {
    if (!projectId.value || !taskToDelete.value) return
    const targetTask = { ...taskToDelete.value }
    isDeleteModalOpen.value = false

    try {
      await deleteTaskMutation.mutateAsync({
        projectId: projectId.value,
        taskId: targetTask.id,
      })

      toast.withAction(
        'info',
        t('projects.tasks.deletedToast', { title: targetTask.title }),
        {
          label: t('projects.tasks.undo'),
          onClick: () => void handleUndoDeleteTask(targetTask),
        },
        7000,
      )
    } catch (error) {
      toast.errorFromUnknown(error)
    } finally {
      taskToDelete.value = null
    }
  }

  async function handleUndoDeleteTask(task: ProjectTask) {
    if (!projectId.value) return
    try {
      await createTaskMutation.mutateAsync({
        projectId: projectId.value,
        payload: {
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          order: task.order,
        },
      })
      toast.success('projects.tasks.restoredToast', { title: task.title })
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    isDeleteModalOpen,
    taskToDelete,
    isDeleting: deleteTaskMutation.isPending,
    handlePromptDeleteTask,
    handleConfirmDeleteTask,
  }
}
