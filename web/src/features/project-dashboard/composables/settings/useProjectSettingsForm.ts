import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import { useDeleteProjectMutation, useProjectQuery, useUpdateProjectMutation } from '../../queries'
import type { ProjectStatus } from '../../types'

export type SettingsSection = 'general' | 'danger'

export function useProjectSettingsForm(projectId: Ref<string>) {
  const router = useRouter()
  const toast = useToast()

  const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)
  const updateProjectMutation = useUpdateProjectMutation()
  const deleteProjectMutation = useDeleteProjectMutation()

  const activeSection = ref<SettingsSection>('general')

  const title = ref('')
  const summary = ref('')
  const status = ref<ProjectStatus>('DRAFT')
  const budget = ref('')
  const currency = ref('USD')
  const startDate = ref('')
  const dueDate = ref('')
  const clientName = ref('')
  const clientEmail = ref('')

  const isDeleteModalOpen = ref(false)
  const confirmInputText = ref('')
  const confirmTitleText = ref('')

  watch(
    project,
    (p) => {
      if (p) {
        title.value = p.title || ''
        summary.value = p.summary || ''
        status.value = p.status || 'DRAFT'
        budget.value = p.budget != null ? String(p.budget) : ''
        currency.value = p.currency || 'USD'
        startDate.value = p.start_date || ''
        dueDate.value = p.due_date || ''
        clientName.value = p.client_name || ''
        clientEmail.value = p.client_email || ''
      }
    },
    { immediate: true },
  )

  async function handleSaveGeneralSettings() {
    if (!projectId.value || !title.value.trim()) return

    try {
      await updateProjectMutation.mutateAsync({
        id: projectId.value,
        payload: {
          title: title.value.trim(),
          summary: summary.value.trim(),
          status: status.value,
          budget: budget.value ? Number(budget.value) : null,
          currency: currency.value,
          start_date: startDate.value || null,
          due_date: dueDate.value || null,
          client_name: clientName.value.trim(),
          client_email: clientEmail.value.trim(),
        },
      })
      toast.success('Project settings updated successfully.')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  function handleOpenDeleteModal() {
    confirmInputText.value = ''
    confirmTitleText.value = ''
    isDeleteModalOpen.value = true
  }

  const isDeleteConfirmed = computed(() => {
    const matchCode = confirmInputText.value.trim().toUpperCase() === 'DELETE'
    const matchTitle = confirmTitleText.value.trim() === (project.value?.title || '').trim()
    return matchCode && matchTitle
  })

  async function handleConfirmDeleteProject() {
    if (!isDeleteConfirmed.value || !projectId.value) return

    try {
      await deleteProjectMutation.mutateAsync(projectId.value)
      isDeleteModalOpen.value = false
      toast.success('Project deleted successfully.')
      void router.push('/app/projects')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    project,
    isPending,
    isError,
    refetch,
    activeSection,
    title,
    summary,
    status,
    budget,
    currency,
    startDate,
    dueDate,
    clientName,
    clientEmail,
    isDeleteModalOpen,
    confirmInputText,
    confirmTitleText,
    isDeleteConfirmed,
    isSaving: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    handleSaveGeneralSettings,
    handleOpenDeleteModal,
    handleConfirmDeleteProject,
  }
}
