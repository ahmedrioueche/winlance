import { onMounted, ref, watch } from 'vue'

const VIEW_MODE_STORAGE_KEY = 'winlance_project_tasks_view_mode'

export function useTaskViewMode() {
  const viewMode = ref<'list' | 'kanban'>('list')

  onMounted(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      if (saved === 'list' || saved === 'kanban') {
        viewMode.value = saved
      }
    } catch {
      // Ignore storage errors
    }
  })

  watch(viewMode, (newMode) => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode)
    } catch {
      // Ignore storage errors
    }
  })

  return {
    viewMode,
  }
}
