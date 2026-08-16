import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import {
  useCreateProjectFromProposalMutation,
  useCreateProposalMutation,
  useCreateProposalVersionMutation,
  useDeleteProposalMutation,
  useProposalQuery,
  useSendProposalEmailMutation,
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
  const { t } = useI18n()

  const { data: proposal, isPending: queryIsPending, isError, refetch } = useProposalQuery(proposalId)
  const isPending = computed(() => proposalId.value !== 'new' && queryIsPending.value && !proposal.value)

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
  const expiresAt = ref('')
  const addons = ref<import('../../types').ProposalAddon[]>([])

  // UI Version States
  const viewingVersion = ref<ProposalVersion | null>(null)
  const isViewingPast = computed(() => viewingVersion.value !== null)

  // Last-saved state for dirty detection
  const lastSaved = ref({
    title: '',
    summary: '',
    body: '',
    amount: 0 as number | string,
    milestonesCount: 0,
    expiresAt: '',
    addonsCount: 0,
  })

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
  const sendModalOpen = ref(false)

  const sendEmailMutation = useSendProposalEmailMutation()

  const clientEmail = computed(() => {
    const p = proposal.value as any
    return p?.client_email || p?.lead_email || ''
  })

  const versions = computed(() => proposal.value?.versions ?? [])
  const hasVersions = computed(() => versions.value.length > 0)

  const isDirty = computed(() => {
    if (viewingVersion.value) return false
    const titleChanged = normalizeText(title.value) !== normalizeText(lastSaved.value.title)
    const summaryChanged = normalizeText(summary.value) !== normalizeText(lastSaved.value.summary)
    const bodyChanged = normalizeText(body.value) !== normalizeText(lastSaved.value.body)
    const amountChanged = normalizeNum(amount.value) !== normalizeNum(lastSaved.value.amount)
    const milestonesChanged = (milestones.value?.length || 0) !== (lastSaved.value.milestonesCount || 0)
    const expiresChanged = (expiresAt.value || '') !== (lastSaved.value.expiresAt || '')
    const addonsChanged = (addons.value?.length || 0) !== (lastSaved.value.addonsCount || 0)
    return titleChanged || summaryChanged || bodyChanged || amountChanged || milestonesChanged || expiresChanged || addonsChanged
  })

  // Initialize fresh local state on new proposal, or sync from fetched proposal data
  watch(
    proposalId,
    (id) => {
      if (id === 'new') {
        const defaultExp = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        viewingVersion.value = null
        title.value = ''
        summary.value = ''
        amount.value = 0
        currency.value = 'USD'
        body.value = ''
        currentStatus.value = 'DRAFT'
        targetProjectName.value = ''
        milestones.value = []
        expiresAt.value = defaultExp || ''
        addons.value = []
        lastSaved.value = { title: '', summary: '', body: '', amount: 0, milestonesCount: 0, expiresAt: defaultExp || '', addonsCount: 0 }
      }
    },
    { immediate: true },
  )

  watch(
    proposal,
    (val) => {
      if (val && proposalId.value !== 'new' && !viewingVersion.value && !isDirty.value) {
        const incomingTitle = val.title || ''
        const incomingSummary = val.summary || ''
        const incomingBody = val.body || ''
        const incomingAmount = val.amount ? Number(val.amount) : 0
        const incomingMilestones = val.milestones || []
        const incomingExpires = val.expires_at ? val.expires_at.split('T')[0] : ''
        const incomingAddons = val.addons || []

        title.value = incomingTitle
        summary.value = incomingSummary
        amount.value = incomingAmount
        currency.value = val.currency || 'USD'
        body.value = incomingBody
        currentStatus.value = val.status || 'DRAFT'
        targetProjectName.value = val.target_project_name || ''
        milestones.value = incomingMilestones
        expiresAt.value = incomingExpires
        addons.value = incomingAddons
        lastSaved.value = {
          title: incomingTitle,
          summary: incomingSummary,
          body: incomingBody,
          amount: incomingAmount,
          milestonesCount: incomingMilestones.length,
          expiresAt: incomingExpires,
          addonsCount: incomingAddons.length,
        }
      }
    },
    { immediate: true },
  )

  // Auto-compute total budget from individual milestone amounts when milestones are present
  watch(
    milestones,
    (mList) => {
      if (!isViewingPast.value && mList && mList.length > 0) {
        const sum = mList.reduce((acc, m) => acc + (Number(m.amount) || 0), 0)
        amount.value = sum
      }
    },
    { deep: true },
  )

  // Auto-save trigger
  function scheduleAutoSave() {
    if (isViewingPast.value || !proposalId.value) return
    if (!isDirty.value && proposalId.value !== 'new') return

    autoSaveStatus.value = 'unsaved'
    if (autoSaveTimer) clearTimeout(autoSaveTimer)

    autoSaveTimer = setTimeout(async () => {
      if (isViewingPast.value || !proposalId.value) return
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

  watch(
    [title, summary, body, amount, currency, targetProjectName, milestones, expiresAt, addons],
    () => {
      if (!isViewingPast.value) {
        scheduleAutoSave()
      }
    },
    { deep: true },
  )

  async function saveContent() {
    if (!proposalId.value) return
    if (proposalId.value === 'new') {
      const hasContent = Boolean(
        title.value.trim() ||
          summary.value.trim() ||
          body.value.trim() ||
          Number(amount.value) > 0 ||
          milestones.value.length > 0,
      )
      if (!hasContent) return

      const formattedExpires = expiresAt.value ? new Date(expiresAt.value).toISOString() : null

      const newProp = await createProposalMutation.mutateAsync({
        title: title.value.trim() || 'New Proposal',
        client: clientId.value || undefined,
        summary: summary.value.trim(),
        amount: Number(amount.value),
        currency: currency.value,
        body: body.value,
        status: currentStatus.value,
        target_project_name: targetProjectName.value.trim(),
        milestones: milestones.value,
        expires_at: formattedExpires,
        addons: addons.value,
      })
      lastSaved.value = {
        title: title.value.trim() || 'New Proposal',
        summary: summary.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        milestonesCount: milestones.value.length,
        expiresAt: expiresAt.value,
        addonsCount: addons.value.length,
      }
      if (clientId.value) {
        void router.replace({
          name: 'client-workspace-proposal-editor',
          params: { id: clientId.value, proposalId: newProp.id },
        })
      } else {
        void router.replace({ name: 'proposal-detail', params: { id: newProp.id } })
      }
      return newProp
    } else {
      const formattedExpires = expiresAt.value ? new Date(expiresAt.value).toISOString() : null

      await updateProposal.mutateAsync({
        id: proposalId.value,
        client: clientId.value || undefined,
        title: title.value.trim(),
        summary: summary.value.trim(),
        amount: Number(amount.value),
        currency: currency.value,
        body: body.value,
        status: currentStatus.value,
        target_project_name: targetProjectName.value.trim(),
        milestones: milestones.value,
        expires_at: formattedExpires,
        addons: addons.value,
      })
      lastSaved.value = {
        title: title.value.trim(),
        summary: summary.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        milestonesCount: milestones.value.length,
        expiresAt: expiresAt.value,
        addonsCount: addons.value.length,
      }
    }
  }

  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
    if (proposalId.value === 'new') {
      const hasContent = Boolean(
        title.value.trim() ||
          summary.value.trim() ||
          body.value.trim() ||
          Number(amount.value) > 0 ||
          milestones.value.length > 0,
      )
      if (hasContent) {
        void saveContent()
      }
    } else if (isDirty.value) {
      void saveContent()
    }
  })

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

  function handlePublish() {
    sendModalOpen.value = true
  }

  async function handleSendEmail(payload: { recipients: string[]; customMessage: string }) {
    if (!proposalId.value) return
    try {
      await saveContent()
      await createVersion.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: 'Dispatched via email',
      })
      await sendEmailMutation.mutateAsync({
        id: proposalId.value,
        recipients: payload.recipients,
        custom_message: payload.customMessage,
        portal_url: portalShareUrl.value,
      })
      currentStatus.value = 'SENT'
      sendModalOpen.value = false
      toast.success(t('proposals.messages.sent', 'Proposal dispatched successfully via email!'))
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleCopyLinkAndMarkSent() {
    if (!proposalId.value) return
    try {
      const urlToCopy = portalShareUrl.value || `${window.location.origin}/portal/proposals/${proposalId.value}`
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(urlToCopy)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = urlToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      await saveContent()
      await createVersion.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: 'Published & shared via portal link',
      })
      currentStatus.value = 'SENT'
      await updateProposal.mutateAsync({
        id: proposalId.value,
        status: 'SENT',
      })
      sendModalOpen.value = false
      toast.success(t('proposals.editor.linkCopiedAndSent', 'Client Portal link copied and proposal marked as Sent!'))
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleMarkReady() {
    if (!proposalId.value) return
    try {
      await saveContent()
      await createVersion.mutateAsync({
        id: proposalId.value,
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: 'Marked as Ready',
      })
      currentStatus.value = 'READY'
      await updateProposal.mutateAsync({
        id: proposalId.value,
        status: 'READY',
      })
      sendModalOpen.value = false
      toast.success(t('proposals.editor.markedReady', 'Proposal status updated to Ready.'))
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
      toast.success(t('proposals.editor.projectCreated', 'Project workspace created successfully!'))
      void router.push(`/app/projects/${res.project_id}/overview`)
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteText.value.trim() !== 'DELETE' || !proposalId.value) return
    try {
      await deleteProposalMutation.mutateAsync(proposalId.value)
      toast.success(t('proposals.editor.deleted', 'Proposal deleted successfully.'))
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

  const portalShareUrl = computed(() => {
    if (!proposalId.value || proposalId.value === 'new') return ''
    const token = proposal.value?.portal_token
    if (token) {
      return `${window.location.origin}/portal/${token}/proposals/${proposalId.value}`
    }
    return `${window.location.origin}/portal/proposals/${proposalId.value}`
  })

  return {
    proposal,
    isPending,
    isError,
    refetch,
    portalShareUrl,
    title,
    summary,
    body,
    amount,
    currency,
    currentStatus,
    targetProjectName,
    milestones,
    expiresAt,
    addons,
    viewingVersion,
    isViewingPast,
    isDirty,
    autoSaveStatus,
    versionModalOpen,
    versionName,
    confirmDialogOpen,
    deleteModalOpen,
    confirmDeleteText,
    sendModalOpen,
    clientEmail,
    sendEmailMutation,
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
    handleSendEmail,
    handleCopyLinkAndMarkSent,
    handleMarkReady,
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
