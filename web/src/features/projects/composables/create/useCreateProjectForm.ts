import { computed, ref, watch } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useProposalsQuery } from '@/features/proposals/queries'
import { useCreateProjectMutation } from '../../queries'

export function useCreateProjectForm(
  presetClientName?: string,
  presetClientEmail?: string,
  onCreatedCallback?: (id: string) => void,
) {
  const toast = useToast()
  const createProjectMutation = useCreateProjectMutation()

  const { data: proposalsData } = useProposalsQuery({})

  const currentStep = ref<1 | 2>(1)

  const title = ref('')
  const clientName = ref(presetClientName || '')
  const clientEmail = ref(presetClientEmail || '')
  const proposalId = ref('')

  const budget = ref<number | string>('')
  const currency = ref('USD')
  const startDate = ref('')
  const dueDate = ref('')
  const summary = ref('')

  const proposals = computed(() => {
    if (!proposalsData.value) return []
    if ('results' in proposalsData.value && Array.isArray(proposalsData.value.results)) {
      return proposalsData.value.results
    }
    if (Array.isArray(proposalsData.value)) {
      return proposalsData.value
    }
    return []
  })

  // Auto-populate when proposal selected
  watch(proposalId, (pId) => {
    if (!pId) return
    const p = proposals.value.find((item) => item.id === pId)
    if (p) {
      if (p.target_project_name || p.title) {
        title.value = p.target_project_name || p.title
      }
      if (p.summary) {
        summary.value = p.summary
      }
      if (p.amount) {
        budget.value = p.amount
      }
      if (p.currency) {
        currency.value = p.currency
      }
      if (!clientName.value && (p as any).client_name) {
        clientName.value = (p as any).client_name
      }
      if (!clientEmail.value && (p as any).client_email) {
        clientEmail.value = (p as any).client_email
      }
    }
  })

  async function handleCreateProject() {
    if (!title.value.trim()) return

    try {
      const created = await createProjectMutation.mutateAsync({
        title: title.value.trim(),
        client_name: clientName.value.trim(),
        client_email: clientEmail.value.trim(),
        proposal: proposalId.value || undefined,
        budget: budget.value ? Number(budget.value) : undefined,
        currency: currency.value,
        start_date: startDate.value || undefined,
        due_date: dueDate.value || undefined,
        summary: summary.value.trim(),
      })

      toast.success('projects.createdToast')
      if (onCreatedCallback) {
        onCreatedCallback(created.id)
      }
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    currentStep,
    title,
    clientName,
    clientEmail,
    proposalId,
    budget,
    currency,
    startDate,
    dueDate,
    summary,
    proposals,
    isSubmitting: createProjectMutation.isPending,
    handleCreateProject,
  }
}
