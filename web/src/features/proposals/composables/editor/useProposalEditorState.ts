import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import {
  useCreateProjectFromProposalMutation,
  useCreateProposalMutation,
  useCreateProposalVersionMutation,
  useDeleteProposalMutation,
  useProposalQuery,
  useUpdateProposalMutation,
} from '../../queries'
import type { ProposalVersion } from '../../types'

function normalizeText(str: string | null | undefined): string {
  return (str || '').replace(/\r\n/g, '\n').trim()
}

function normalizeNum(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

export function useProposalEditorState(proposalId: Ref<string>, clientId: Ref<string>) {
  const router = useRouter()
  const toast = useToast()

  const { data: proposal, isPending: queryIsPending, isError, refetch } = useProposalQuery(proposalId)
  const isPending = computed(() => proposalId.value !== 'new' && queryIsPending.value)

  const updateProposal = useUpdateProposalMutation()
  const createVersion = useCreateProposalVersionMutation()
  const deleteProposalMutation = useDeleteProposalMutation()
  const createProjectMutation = useCreateProjectFromProposalMutation()
  const createProposalMutation = useCreateProposalMutation()

  // Document Form State
  const title = ref('')
  const summary = ref('')
  const amount = ref<number | string>(0)
  const currency = ref('USD')
  const body = ref('')
  const currentStatus = ref('DRAFT')
  const targetProjectName = ref('')
  const milestones = ref<import('../../types').ProposalMilestone[]>([])

  // UI Version States
  const viewingVersion = ref<ProposalVersion | null>(null)
  const isViewingPast = computed(() => viewingVersion.value !== null)

  // Last-saved state for dirty detection
  const lastSaved = ref({ title: '', body: '', amount: 0 as number | string })

  // Auto-save state
  const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'unsaved'>('idle')
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  // Modals state
  const versionModalOpen = ref(false)
  const versionName = ref('')
  const confirmDialogOpen = ref(false)
  const pendingViewVersion = ref<ProposalVersion | null>(null)
  const deleteModalOpen = ref(false)
  const confirmDeleteText = ref('')

  const versions = computed(() => proposal.value?.versions ?? [])
  const hasVersions = computed(() => versions.value.length > 0)

  const isDirty = computed(() => {
    if (viewingVersion.value) return false
    const titleChanged = normalizeText(title.value) !== normalizeText(lastSaved.value.title)
    const bodyChanged = normalizeText(body.value) !== normalizeText(lastSaved.value.body)
    const amountChanged = normalizeNum(amount.value) !== normalizeNum(lastSaved.value.amount)
    return titleChanged || bodyChanged || amountChanged
  })

  // Watch proposal data to populate form
  watch(
    proposal,
    (val) => {
      if (val && !viewingVersion.value && !isDirty.value) {
        const incomingTitle = val.title || ''
        const incomingBody = val.body || ''
        const incomingAmount = val.amount ? Number(val.amount) : 0

        title.value = incomingTitle
        summary.value = val.summary || ''
        amount.value = incomingAmount
        currency.value = val.currency || 'USD'
        body.value = incomingBody
        currentStatus.value = val.status || 'DRAFT'
        targetProjectName.value = val.target_project_name || ''
        milestones.value = val.milestones || []
        lastSaved.value = {
          title: incomingTitle,
          body: incomingBody,
          amount: incomingAmount,
        }
      }
    },
    { immediate: true },
  )

  // Auto-save trigger
  function scheduleAutoSave() {
    if (isViewingPast.value || !proposalId.value || proposalId.value === 'new') return
    if (!isDirty.value) return

    autoSaveStatus.value = 'unsaved'
    if (autoSaveTimer) clearTimeout(autoSaveTimer)

    autoSaveTimer = setTimeout(async () => {
      if (!isDirty.value || isViewingPast.value || !proposalId.value || proposalId.value === 'new') return
      autoSaveStatus.value = 'saving'
      try {
        await saveContent()
        autoSaveStatus.value = 'saved'
        setTimeout(() => {
          if (autoSaveStatus.value === 'saved') {
            autoSaveStatus.value = 'idle'
          }
        }, 2500)
      } catch {
        autoSaveStatus.value = 'unsaved'
      }
    }, 1200)
  }

  watch([title, body, amount, currency], () => {
    if (!isViewingPast.value && proposal.value) {
      scheduleAutoSave()
    }
  })

  async function saveContent() {
    if (!proposalId.value || proposalId.value === 'new') return
    await updateProposal.mutateAsync({
      id: proposalId.value,
      title: title.value.trim(),
      summary: summary.value.trim(),
      amount: Number(amount.value),
      currency: currency.value,
      body: body.value,
      status: currentStatus.value,
      target_project_name: targetProjectName.value.trim(),
      milestones: milestones.value,
    })
    lastSaved.value = {
      title: title.value.trim(),
      body: body.value,
      amount: Number(amount.value),
    }
  }

  async function handleSave() {
    try {
      await saveContent()
      if (hasVersions.value) {
        versionName.value = ''
        versionModalOpen.value = true
      } else {
        toast.success('proposals.messages.saved')
      }
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleVersionConfirm() {
    if (!proposalId.value) return
    try {
      await createVersion.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: versionName.value.trim() || 'Updated proposal',
      })
      versionModalOpen.value = false
      versionName.value = ''
      toast.success('proposals.messages.saved')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  function handleVersionSkip() {
    versionModalOpen.value = false
    versionName.value = ''
    toast.success('proposals.messages.saved')
  }

  async function handlePublish() {
    if (!proposalId.value) return
    try {
      await saveContent()
      await createVersion.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: 'Published version',
      })
      currentStatus.value = 'SENT'
      await updateProposal.mutateAsync({
        id: proposalId.value,
        status: 'SENT',
      })
      toast.success('proposals.messages.sent')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleStatusChange() {
    if (!proposalId.value) return
    try {
      await updateProposal.mutateAsync({
        id: proposalId.value,
        status: currentStatus.value,
      })
      toast.success('proposals.messages.saved')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  function handleViewVersion(ver: ProposalVersion) {
    if (isDirty.value) {
      pendingViewVersion.value = ver
      confirmDialogOpen.value = true
      return
    }
    enterVersionView(ver)
  }

  async function handleSaveAndView() {
    confirmDialogOpen.value = false
    try {
      await saveContent()
      toast.success('proposals.messages.saved')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
    if (pendingViewVersion.value) enterVersionView(pendingViewVersion.value)
    pendingViewVersion.value = null
  }

  function handleDiscardAndView() {
    confirmDialogOpen.value = false
    title.value = lastSaved.value.title
    body.value = lastSaved.value.body
    amount.value = lastSaved.value.amount
    if (pendingViewVersion.value) enterVersionView(pendingViewVersion.value)
    pendingViewVersion.value = null
  }

  function enterVersionView(ver: ProposalVersion) {
    viewingVersion.value = ver
    title.value = ver.title
    body.value = ver.body
    amount.value = Number(ver.amount)
  }

  function handleRestore() {
    viewingVersion.value = null
  }

  function handleBackToLatest() {
    viewingVersion.value = null
    if (proposal.value) {
      title.value = proposal.value.title || ''
      body.value = proposal.value.body || ''
      amount.value = proposal.value.amount ? Number(proposal.value.amount) : 0
      currentStatus.value = proposal.value.status || 'DRAFT'
    }
  }

  async function handleCreateProject() {
    if (!proposalId.value) return
    try {
      const res = await createProjectMutation.mutateAsync(proposalId.value)
      toast.success('Project workspace created successfully!')
      void router.push(`/app/projects/${res.project_id}/overview`)
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteText.value.trim() !== 'DELETE' || !proposalId.value) return
    try {
      await deleteProposalMutation.mutateAsync(proposalId.value)
      toast.success('Proposal deleted successfully.')
      deleteModalOpen.value = false
      if (clientId.value) {
        void router.push(`/app/clients/${clientId.value}/proposals`)
      } else {
        void router.push('/app/proposals')
      }
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    proposal,
    isPending,
    isError,
    refetch,
    title,
    summary,
    body,
    amount,
    currency,
    currentStatus,
    targetProjectName,
    milestones,
    viewingVersion,
    isViewingPast,
    isDirty,
    autoSaveStatus,
    versionModalOpen,
    versionName,
    confirmDialogOpen,
    deleteModalOpen,
    confirmDeleteText,
    versions,
    hasVersions,
    updateProposal,
    createVersion,
    deleteProposalMutation,
    createProjectMutation,
    createProposalMutation,
    saveContent,
    handleSave,
    handleVersionConfirm,
    handleVersionSkip,
    handlePublish,
    handleStatusChange,
    handleViewVersion,
    handleSaveAndView,
    handleDiscardAndView,
    handleRestore,
    handleBackToLatest,
    handleCreateProject,
    handleConfirmDelete,
  }
}
