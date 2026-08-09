import { ref, type Ref } from 'vue'
import { useReorderTasksMutation, useUpdateTaskMutation } from '../../queries'
import type { ProjectTask, TaskStatus } from '../../types'

export function useTaskReordering(
  projectId: Ref<string>,
  tasks: Ref<ProjectTask[]>,
  filteredTasks: Ref<ProjectTask[]>,
  onError: (error: unknown) => void,
) {
  const updateTaskMutation = useUpdateTaskMutation()
  const reorderTasksMutation = useReorderTasksMutation()

  const draggedTaskId = ref<string | null>(null)
  const draggedRowIndex = ref<number | null>(null)

  async function handleQuickStatusChange(task: ProjectTask, newStatus: TaskStatus) {
    if (!projectId.value || task.status === newStatus) return
    try {
      await updateTaskMutation.mutateAsync({
        projectId: projectId.value,
        taskId: task.id,
        payload: { status: newStatus },
      })
    } catch (error) {
      onError(error)
    }
  }

  function handleDragStart(taskId: string) {
    draggedTaskId.value = taskId
  }

  async function handleDropOnColumn(targetStatus: TaskStatus) {
    if (!draggedTaskId.value || !projectId.value) return
    const taskId = draggedTaskId.value
    draggedTaskId.value = null

    const task = tasks.value.find((t) => t.id === taskId)
    if (!task || task.status === targetStatus) return

    try {
      await updateTaskMutation.mutateAsync({
        projectId: projectId.value,
        taskId,
        payload: { status: targetStatus },
      })
    } catch (error) {
      onError(error)
    }
  }

  function handleRowDragStart(index: number) {
    draggedRowIndex.value = index
  }

  async function handleRowDrop(targetIndex: number) {
    if (draggedRowIndex.value === null || draggedRowIndex.value === targetIndex || !projectId.value) return
    const fromIndex = draggedRowIndex.value
    draggedRowIndex.value = null

    const list = [...filteredTasks.value]
    const [moved] = list.splice(fromIndex, 1)
    if (!moved) return
    list.splice(targetIndex, 0, moved)

    const orders = list.map((t, idx) => ({ id: t.id, order: idx + 1 }))
    try {
      await reorderTasksMutation.mutateAsync({ projectId: projectId.value, orders })
    } catch (error) {
      onError(error)
    }
  }

  async function handleMoveRow(index: number, direction: 'up' | 'down') {
    if (!projectId.value) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= filteredTasks.value.length) return

    const list = [...filteredTasks.value]
    const [moved] = list.splice(index, 1)
    if (!moved) return
    list.splice(targetIndex, 0, moved)

    const orders = list.map((t, idx) => ({ id: t.id, order: idx + 1 }))
    try {
      await reorderTasksMutation.mutateAsync({ projectId: projectId.value, orders })
    } catch (error) {
      onError(error)
    }
  }

  return {
    draggedTaskId,
    draggedRowIndex,
    handleQuickStatusChange,
    handleDragStart,
    handleDropOnColumn,
    handleRowDragStart,
    handleRowDrop,
    handleMoveRow,
  }
}
