<script setup lang="ts">
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  GitCompare,
  Globe,
  History,
  Loader2,
  RotateCcw,
  Search,
  Send,
  X,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import MarkdownRenderer from '@/shared/components/markdown/MarkdownRenderer.vue'
import MarkdownToolbar from '@/shared/components/markdown/MarkdownToolbar.vue'
import { useToast } from '@/shared/toast/useToast'
import { computeSideBySideDiff } from '@/shared/utils/diff'

import {
  useAcceptPortalProposalMutation,
  usePortalInfoQuery,
  usePortalProposalQuery,
  useSuggestPortalEditsMutation,
} from '../../queries'
import type { ProposalVersion } from '../../types'

const { t, d } = useI18n()
const route = useRoute()
const toast = useToast()

const token = computed(() => String(route.params.token || ''))
const proposalId = computed(() => String(route.params.proposalId || ''))

const { data: portalInfo } = usePortalInfoQuery(token)
const { data: proposal, isPending, isError, refetch } = usePortalProposalQuery(token, proposalId)

const suggestEdits = useSuggestPortalEditsMutation()
const acceptProposal = useAcceptPortalProposalMutation()

// ─── Document Form State ─────────────────────────────────────────
const title = ref('')
const amount = ref<number | string>(0)
const currency = ref('USD')
const body = ref('')

// Last-saved state for dirty detection
const lastSaved = ref({ title: '', body: '', amount: 0 as number | string })

// Auto-save state
const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'unsaved'>('idle')
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// UI State
const versionModalOpen = ref(false)
const versionName = ref('')
const confirmDialogOpen = ref(false)
const pendingViewVersion = ref<ProposalVersion | null>(null)
const versionDrawerOpen = ref(false)
const isEditMode = ref(false)

// Version viewing / comparison
const viewingVersion = ref<ProposalVersion | null>(null)
const comparingVersion = ref<ProposalVersion | null>(null)
const compareTargetId = ref<string>('current')

// Normalized helper functions for dirty check
function normalizeText(str: string | null | undefined): string {
  return (str || '').replace(/\r\n/g, '\n').trim()
}

function normalizeNum(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

// Version search & scalability state
const versionSearch = ref('')
const versionRoleFilter = ref<'all' | 'freelancer' | 'client'>('all')
const showAllVersions = ref(false)

// ─── Computed ────────────────────────────────────────────────────
const versions = computed(() => proposal.value?.versions ?? [])

const filteredVersions = computed(() => {
  let list = versions.value

  if (versionRoleFilter.value !== 'all') {
    list = list.filter((v) => v.created_by_role === versionRoleFilter.value)
  }

  if (versionSearch.value.trim()) {
    const q = versionSearch.value.trim().toLowerCase()
    list = list.filter(
      (v) =>
        `v${v.version_number}`.toLowerCase().includes(q) ||
        (v.change_summary || '').toLowerCase().includes(q) ||
        (v.created_by_role || '').toLowerCase().includes(q),
    )
  }

  return list
})

const visibleVersions = computed(() => {
  if (
    versions.value.length <= 5 ||
    showAllVersions.value ||
    versionSearch.value.trim() ||
    versionRoleFilter.value !== 'all'
  ) {
    return filteredVersions.value
  }
  return filteredVersions.value.slice(0, 5)
})

const isViewingPast = computed(() => viewingVersion.value !== null)
const isComparing = computed(() => comparingVersion.value !== null)

const isDirty = computed(() => {
  if (viewingVersion.value || !proposal.value) return false // Past version viewing is read-only

  const titleChanged = normalizeText(title.value) !== normalizeText(proposal.value.title)
  const bodyChanged = normalizeText(body.value) !== normalizeText(proposal.value.body)
  const amountChanged = normalizeNum(amount.value) !== normalizeNum(proposal.value.amount)

  return titleChanged || bodyChanged || amountChanged
})

// Current Version Badge identity string
const currentVersionBadge = computed(() => {
  if (isViewingPast.value && viewingVersion.value) {
    return `v${viewingVersion.value.version_number} (${t('portal.proposalView.historicalSnapshot', 'Historical Snapshot')})`
  }
  if (isDirty.value) {
    return t('portal.proposalView.workingRevisionDraft', 'Working Revision Draft')
  }
  if (versions.value.length > 0 && versions.value[0]) {
    const latest = versions.value[0]
    const author = latest.created_by_role === 'client' ? 'Client' : 'Freelancer'
    return `v${latest.version_number} (${author} — ${latest.change_summary || 'Submitted'})`
  }
  return `v1 (${t('portal.proposalView.submittedProposal', 'Submitted Proposal')})`
})

// ─── Populate form when proposal loads ───────────────────────────
watch(
  proposal,
  (val) => {
    if (val && !viewingVersion.value) {
      // Check if there is a saved unsubmitted draft in sessionStorage
      const sessionDraft = sessionStorage.getItem(`winlance_portal_draft_${proposalId.value}`)
      if (sessionDraft) {
        try {
          const parsed = JSON.parse(sessionDraft)
          title.value = parsed.title ?? val.title ?? ''
          body.value = parsed.body ?? val.body ?? ''
          amount.value = parsed.amount ?? (val.amount ? Number(val.amount) : 0)
          currency.value = val.currency || 'USD'
          return
        } catch {
          // Fall back to server proposal if json parse error
        }
      }

      // Default to server proposal
      title.value = val.title || ''
      amount.value = val.amount ? Number(val.amount) : 0
      currency.value = val.currency || 'USD'
      body.value = val.body || ''
    }
  },
  { immediate: true },
)

// Debounced auto-save trigger
function scheduleAutoSave() {
  if (isViewingPast.value || !proposalId.value || proposal.value?.status === 'ACCEPTED') return
  if (!isDirty.value) {
    sessionStorage.removeItem(`winlance_portal_draft_${proposalId.value}`)
    return
  }

  autoSaveStatus.value = 'unsaved'

  if (autoSaveTimer) clearTimeout(autoSaveTimer)

  autoSaveTimer = setTimeout(() => {
    if (!isDirty.value || isViewingPast.value || !proposalId.value) return
    autoSaveStatus.value = 'saving'
    try {
      saveClientDraft()
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

// Compare Target Options & Content
const compareTargetOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [
    { value: 'current', label: t('portal.diff.currentWorkingDraft', 'Current Working Draft') },
  ]
  versions.value.forEach((v) => {
    if (v.id !== comparingVersion.value?.id) {
      opts.push({
        value: v.id,
        label: `v${v.version_number} — ${v.change_summary || 'Version'} (${formatAuthor(v)})`,
      })
    }
  })
  return opts
})

const compareRightContent = computed(() => {
  if (compareTargetId.value === 'current') {
    return proposal.value?.body || body.value
  }
  const match = versions.value.find((v) => v.id === compareTargetId.value)
  return match?.body ?? ''
})

const compareRightLabel = computed(() => {
  if (compareTargetId.value === 'current') {
    return t('portal.diff.currentWorkingDraft', 'Current Working Draft')
  }
  const match = versions.value.find((v) => v.id === compareTargetId.value)
  return match ? `v${match.version_number} (${match.change_summary})` : 'Selected Version'
})

const compareRightTitle = computed(() => {
  if (compareTargetId.value === 'current') {
    return title.value || proposal.value?.title || ''
  }
  const match = versions.value.find((v) => v.id === compareTargetId.value)
  return match?.title ?? ''
})

const compareRightAmount = computed(() => {
  if (compareTargetId.value === 'current') {
    return Number(amount.value || proposal.value?.amount || 0)
  }
  const match = versions.value.find((v) => v.id === compareTargetId.value)
  return match ? Number(match.amount || 0) : 0
})

const compareRightCurrency = computed(() => {
  if (compareTargetId.value === 'current') {
    return currency.value || proposal.value?.currency || 'USD'
  }
  const match = versions.value.find((v) => v.id === compareTargetId.value)
  return match?.currency ?? 'USD'
})

const leftAmount = computed(() => Number(comparingVersion.value?.amount || 0))
const leftCurrency = computed(() => comparingVersion.value?.currency || 'USD')
const leftTitle = computed(() => comparingVersion.value?.title || '')

const amountDiff = computed(() => compareRightAmount.value - leftAmount.value)
const hasAmountDiff = computed(() => leftAmount.value !== compareRightAmount.value)
const hasTitleDiff = computed(() => normalizeText(leftTitle.value) !== normalizeText(compareRightTitle.value))

// Robust LCS Line Diff
const diffLines = computed(() => {
  if (!comparingVersion.value) return { left: [], right: [] }
  return computeSideBySideDiff(comparingVersion.value.body, compareRightContent.value)
})

// ─── Actions ─────────────────────────────────────────────────────

function saveClientDraft() {
  if (!proposalId.value) return
  sessionStorage.setItem(
    `winlance_portal_draft_${proposalId.value}`,
    JSON.stringify({
      title: title.value.trim(),
      body: body.value,
      amount: Number(amount.value),
    }),
  )
}

/** Open Submit Revision Modal */
function handleOpenSubmitRevision() {
  versionName.value = ''
  versionModalOpen.value = true
}

/** Confirm Submit Revision */
async function handleSubmitRevisionConfirm() {
  if (!proposalId.value || !token.value) return
  try {
    await suggestEdits.mutateAsync({
      token: token.value,
      proposalId: proposalId.value,
      payload: {
        title: title.value.trim(),
        body: body.value,
        amount: Number(amount.value),
        change_summary: versionName.value.trim() || 'Client requested revisions',
      },
    })
    sessionStorage.removeItem(`winlance_portal_draft_${proposalId.value}`)
    versionModalOpen.value = false
    versionName.value = ''
    isEditMode.value = false
    toast.success(t('portal.proposalView.revisionSubmittedToast', 'Your revision suggestions have been submitted to your freelancer!'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** Accept Proposal */
async function handleAcceptProposal() {
  if (!proposalId.value || !token.value) return
  try {
    await acceptProposal.mutateAsync({
      token: token.value,
      proposalId: proposalId.value,
    })
    toast.success(t('portal.proposalView.proposalAcceptedToast', 'Proposal accepted! Project & task list automatically generated.'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** View a past version */
function handleViewVersion(ver: ProposalVersion) {
  if (isDirty.value) {
    pendingViewVersion.value = ver
    confirmDialogOpen.value = true
    return
  }
  enterVersionView(ver)
}

function enterVersionView(ver: ProposalVersion) {
  viewingVersion.value = ver
  title.value = ver.title
  body.value = ver.body
  amount.value = Number(ver.amount)
}

function handleDiscardAndView() {
  confirmDialogOpen.value = false
  title.value = lastSaved.value.title
  body.value = lastSaved.value.body
  amount.value = lastSaved.value.amount
  if (pendingViewVersion.value) enterVersionView(pendingViewVersion.value)
  pendingViewVersion.value = null
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
  }
}

function handleCompare(ver: ProposalVersion) {
  comparingVersion.value = ver
  compareTargetId.value = 'current'
  versionDrawerOpen.value = false
}

function handleCloseComparison() {
  comparingVersion.value = null
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'SENT':
    case 'READY':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case 'UNDER_REVIEW':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'CHANGES_REQUESTED':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    case 'REJECTED':
    case 'EXPIRED':
    case 'WITHDRAWN':
      return 'bg-error-soft text-error border-error/30'
    case 'DRAFT':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr.split('T')[0] ?? ''
  }
}

function formatAuthor(ver: ProposalVersion): string {
  if (ver.created_by_name) {
    return ver.created_by_role === 'client' ? `${ver.created_by_name} (Client)` : ver.created_by_name
  }
  return ver.created_by_role === 'client' ? 'Client' : 'Freelancer'
}
</script>

<template>
  <div class="min-h-screen space-y-6">
    <!-- ═══ FULL-WIDTH DIFF COMPARISON MODE ═══ -->
    <template v-if="isComparing && comparingVersion">
      <!-- Diff Header Bar -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft">
        <div class="flex items-center gap-3">
          <GitCompare class="h-5 w-5 text-accent" />
          <div>
            <h2 class="font-display text-base font-bold text-ink">
              Comparing: v{{ comparingVersion.version_number }}
              <span class="text-muted font-normal">({{ comparingVersion.change_summary }})</span>
              vs {{ compareRightLabel }}
            </h2>
            <p class="text-xs text-muted">
              Base: {{ formatAuthor(comparingVersion) }} · {{ formatDate(comparingVersion.created_at) }}
            </p>
          </div>
        </div>
        <BaseButton variant="secondary" size="sm" @click="handleCloseComparison">
          <X class="h-3.5 w-3.5" />
          <span>Close Comparison</span>
        </BaseButton>
      </div>

      <!-- Financial & Title Diff Summary Bar -->
      <div
        v-if="hasAmountDiff || hasTitleDiff"
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-canvas-elevated p-3.5 shadow-sm text-xs"
      >
        <!-- Price Diff Pill -->
        <div v-if="hasAmountDiff" class="flex items-center gap-2">
          <span class="font-semibold text-muted">Estimated Amount Diff:</span>
          <div class="flex items-center gap-1.5 font-bold">
            <span class="text-ink">${{ leftAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ leftCurrency }}</span>
            <span class="text-muted">➔</span>
            <span class="text-ink">${{ compareRightAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ compareRightCurrency }}</span>
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              :class="amountDiff > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'"
            >
              {{ amountDiff > 0 ? '+' : '' }}${{ amountDiff.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>

        <!-- Title Diff Pill -->
        <div v-if="hasTitleDiff" class="flex items-center gap-2">
          <span class="font-semibold text-muted">Title Changed:</span>
          <span class="line-through text-muted">{{ leftTitle }}</span>
          <span class="text-muted">➔</span>
          <span class="font-bold text-ink">{{ compareRightTitle }}</span>
        </div>
      </div>

      <!-- Side-by-Side Diff Panels -->
      <div class="grid grid-cols-1 gap-0 lg:grid-cols-2 rounded-2xl border border-border overflow-hidden shadow-lift">
        <!-- Left: Base Version Content -->
        <div class="border-b lg:border-b-0 lg:border-r border-border">
          <div class="flex h-14 items-center gap-2 border-b border-border bg-canvas-muted px-5">
            <History class="h-4 w-4 text-muted shrink-0" />
            <span class="text-sm font-bold text-ink">v{{ comparingVersion.version_number }}</span>
            <span class="text-xs text-muted truncate">— {{ comparingVersion.change_summary }}</span>
          </div>
          <div class="max-h-[70vh] overflow-auto bg-canvas p-5 font-mono text-sm leading-relaxed">
            <div
              v-for="(line, idx) in diffLines.left"
              :key="`l-${idx}`"
              class="min-h-[1.5rem] px-2 py-0.5"
              :class="{
                'bg-red-500/10 text-red-700 dark:text-red-300 rounded': line.type === 'remove',
                'text-ink-soft': line.type === 'same',
                'opacity-0': line.type === 'empty',
              }"
            >
              <span v-if="line.type === 'remove'" class="font-bold text-red-500 me-2 select-none">−</span>
              <span>{{ line.text || ' ' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Comparison Target -->
        <div>
          <div class="flex h-14 items-center justify-between gap-3 border-b border-border bg-canvas-muted px-5">
            <div class="flex items-center gap-2 min-w-0">
              <Globe class="h-4 w-4 text-accent shrink-0" />
              <span class="text-xs font-semibold text-muted shrink-0">Compare against:</span>
            </div>
            <div class="w-64 shrink-0">
              <BaseSelect
                v-model="compareTargetId"
                label=""
                :options="compareTargetOptions"
              />
            </div>
          </div>
          <div class="max-h-[70vh] overflow-auto bg-canvas p-5 font-mono text-sm leading-relaxed">
            <div
              v-for="(line, idx) in diffLines.right"
              :key="`r-${idx}`"
              class="min-h-[1.5rem] px-2 py-0.5"
              :class="{
                'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded': line.type === 'add',
                'text-ink-soft': line.type === 'same',
                'opacity-0': line.type === 'empty',
              }"
            >
              <span v-if="line.type === 'add'" class="font-bold text-emerald-500 me-2 select-none">+</span>
              <span>{{ line.text || ' ' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ NORMAL CLIENT DOCUMENT EDITOR MODE ═══ -->
    <template v-else>
      <!-- Read-Only Past Version Banner -->
      <div
        v-if="isViewingPast && viewingVersion"
        class="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
      >
        <div class="flex items-center gap-2">
          <Eye class="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span class="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {{ t('portal.version.viewingBanner', 'Viewing v{version} — "{summary}"', { version: viewingVersion.version_number, summary: viewingVersion.change_summary }) }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" @click="handleRestore">
            <RotateCcw class="h-3.5 w-3.5" />
            <span>{{ t('portal.version.restore', 'Restore this version') }}</span>
          </BaseButton>
          <BaseButton size="sm" @click="handleBackToLatest">
            {{ t('portal.version.backToLatest', 'Back to latest') }}
          </BaseButton>
        </div>
      </div>

      <!-- Header Control Bar -->
      <div class="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft">
        <div class="flex flex-wrap items-center gap-3 min-w-0">
          <div class="flex flex-wrap items-center gap-2.5 min-w-0">
            <h1 class="font-display text-lg font-bold text-ink truncate">
              {{ title || t('portal.proposalView.defaultTitle', 'Proposal Review') }}
            </h1>
            <span
              v-if="proposal?.status"
              class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shrink-0"
              :class="getStatusBadgeClass(proposal.status)"
            >
              {{ proposal.status.replace('_', ' ') }}
            </span>
            <span class="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent shrink-0">
              {{ currentVersionBadge }}
            </span>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- Auto-save Status Indicator (Fixed 36px Icon with Tooltip) -->
          <div
            v-if="autoSaveStatus !== 'idle' && !isViewingPast && proposal?.status !== 'ACCEPTED' && isEditMode"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-xs shrink-0"
          >
            <span v-if="autoSaveStatus === 'saving'" :title="t('common.status.autoSaving', 'Auto-saving...')">
              <Loader2 class="h-4 w-4 animate-spin text-accent" />
            </span>
            <span v-else-if="autoSaveStatus === 'saved'" :title="t('common.status.autoSaved', 'Auto-saved')">
              <Check class="h-4 w-4 text-emerald-500" />
            </span>
            <span v-else-if="autoSaveStatus === 'unsaved'" :title="t('common.status.unsavedChanges', 'Unsaved changes')">
              <Clock class="h-4 w-4 text-amber-500" />
            </span>
          </div>

          <!-- Edit Proposal Toggle Button -->
          <BaseButton
            v-if="!isViewingPast && proposal?.status !== 'ACCEPTED'"
            variant="secondary"
            size="sm"
            @click="isEditMode = !isEditMode"
          >
            <Eye v-if="isEditMode" class="h-3.5 w-3.5" />
            <Edit3 v-else class="h-3.5 w-3.5" />
            <span>{{ isEditMode ? t('portal.proposalView.doneEditing', 'Done Editing') : t('portal.proposalView.editProposal', 'Edit Proposal') }}</span>
          </BaseButton>

          <!-- Version History Dropdown Trigger -->
          <button
            type="button"
            class="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 text-xs font-semibold text-ink hover:bg-canvas-muted transition-colors"
            @click="versionDrawerOpen = !versionDrawerOpen"
          >
            <History class="h-3.5 w-3.5 text-accent" />
            <span>{{ t('portal.proposalView.history', 'History ({count})', { count: versions.length }) }}</span>
          </button>

          <!-- Submit Revision Button (Disabled until client makes changes) -->
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="!isDirty || isViewingPast || proposal?.status === 'ACCEPTED'"
            @click="handleOpenSubmitRevision"
          >
            <Send class="h-3.5 w-3.5" />
            <span>{{ t('portal.proposalView.submitRevision', 'Submit Revision') }}</span>
          </BaseButton>

          <!-- Accept Proposal Button -->
          <BaseButton
            size="sm"
            :loading="acceptProposal.isPending.value"
            :disabled="isViewingPast || proposal?.status === 'ACCEPTED'"
            @click="handleAcceptProposal"
          >
            <CheckCircle2 class="h-3.5 w-3.5" />
            <span>{{ proposal?.status === 'ACCEPTED' ? t('portal.proposalView.accepted', 'Accepted') : t('portal.proposalView.acceptOffer', 'Accept Offer') }}</span>
          </BaseButton>
        </div>
      </div>

      <!-- Collapsible Version History Panel -->
      <div
        v-if="versionDrawerOpen"
        class="w-full rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3"
      >
        <div class="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
            <History class="h-4 w-4 text-accent" />
            {{ t('portal.version.historyTitle', 'Version History & Revisions') }}
          </span>
          <button class="text-xs text-muted hover:text-ink" @click="versionDrawerOpen = false">
            ✕ {{ t('common.actions.close', 'Close') }}
          </button>
        </div>

        <!-- Search & Filter Controls (Only rendered if versions.length > 5) -->
        <div v-if="versions.length > 5" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div class="relative flex-1">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              v-model="versionSearch"
              type="text"
              placeholder="Search versions (v#, summary)..."
              class="w-full rounded-lg border border-border bg-canvas pl-8 pr-3 py-1 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-1 rounded-lg border border-border bg-canvas p-0.5 text-xs shrink-0">
            <button
              type="button"
              class="rounded-md px-2.5 py-0.5 font-medium transition-colors"
              :class="versionRoleFilter === 'all' ? 'bg-accent text-accent-contrast font-semibold' : 'text-muted hover:text-ink'"
              @click="versionRoleFilter = 'all'"
            >
              All ({{ versions.length }})
            </button>
            <button
              type="button"
              class="rounded-md px-2.5 py-0.5 font-medium transition-colors"
              :class="versionRoleFilter === 'freelancer' ? 'bg-accent text-accent-contrast font-semibold' : 'text-muted hover:text-ink'"
              @click="versionRoleFilter = 'freelancer'"
            >
              Freelancer ({{ versions.filter(v => v.created_by_role === 'freelancer').length }})
            </button>
            <button
              type="button"
              class="rounded-md px-2.5 py-0.5 font-medium transition-colors"
              :class="versionRoleFilter === 'client' ? 'bg-purple-600 text-white font-semibold' : 'text-muted hover:text-ink'"
              @click="versionRoleFilter = 'client'"
            >
              Client ({{ versions.filter(v => v.created_by_role === 'client').length }})
            </button>
          </div>
        </div>

        <div v-if="filteredVersions.length === 0" class="text-xs text-muted text-center py-4">
          {{ t('portal.version.noVersions', 'No versions found.') }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          <div
            v-for="ver in visibleVersions"
            :key="ver.id"
            class="rounded-xl border p-3 text-xs space-y-2"
            :class="viewingVersion?.id === ver.id ? 'border-accent bg-accent-soft' : 'border-border bg-canvas'"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-ink">v{{ ver.version_number }}</span>
              <span
                class="rounded bg-canvas-muted px-2 py-0.5 text-[10px] font-medium uppercase"
                :class="ver.created_by_role === 'client' ? 'text-purple-600 dark:text-purple-400' : 'text-muted'"
              >
                {{ ver.created_by_role }}
              </span>
            </div>

            <p class="text-ink-soft font-medium truncate">
              "{{ ver.change_summary }}"
            </p>
            <p class="text-muted text-[11px]">
              {{ formatAuthor(ver) }} · {{ formatDate(ver.created_at) }}
            </p>

            <div class="pt-2 border-t border-border/60 flex items-center gap-2">
              <button
                class="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                @click="handleViewVersion(ver)"
              >
                <Eye class="h-3 w-3" />
                <span>{{ t('portal.version.view', 'View') }}</span>
              </button>
              <button
                class="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                @click="handleCompare(ver)"
              >
                <GitCompare class="h-3 w-3" />
                <span>{{ t('portal.version.compare', 'Compare') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Show Older Versions Expand Button (Only rendered if versions.length > 5 and not showing all) -->
        <div v-if="versions.length > 5 && !showAllVersions && !versionSearch && versionRoleFilter === 'all'" class="pt-1 text-center border-t border-border/60">
          <button
            type="button"
            class="text-xs font-semibold text-accent hover:underline flex items-center justify-center gap-1 mx-auto"
            @click="showAllVersions = true"
          >
            <span>Show older versions ({{ versions.length - 5 }} remaining)</span>
            <ChevronDown class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isPending" class="w-full space-y-6">
        <Skeleton class="h-[650px] w-full rounded-2xl" />
      </div>

      <!-- Error State -->
      <ErrorState
        v-else-if="isError"
        class="w-full"
        :title="t('portal.errors.loadProposalFailed', 'Failed to load proposal')"
        :retry-label="t('common.actions.retry', 'Try again')"
        @retry="refetch()"
      />

      <!-- ─── CENTERED FULL-WIDTH DOCUMENT CANVAS ─── -->
      <div v-else class="w-full">
        <div
          class="relative rounded-2xl border bg-canvas-elevated p-6 sm:p-10 shadow-lift min-h-[750px] space-y-6"
          :class="isViewingPast ? 'border-amber-500/40 border-dashed' : 'border-border'"
        >
          <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-10 rounded-2xl" aria-hidden="true" />

          <!-- Read-Only Document Card Mode (Default) -->
          <div v-if="!isEditMode && !isViewingPast" class="relative z-10 space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
              <div>
                <span class="text-xs font-semibold text-accent uppercase tracking-wider">{{ t('portal.proposalView.officialProposal', 'Official Proposal') }}</span>
                <h2 class="font-display text-2xl font-bold tracking-tight text-ink mt-0.5">
                  {{ title }}
                </h2>
              </div>

              <!-- Amount Badge -->
              <div class="flex items-center gap-2 rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm shrink-0 shadow-sm">
                <span class="text-muted font-medium">{{ t('portal.proposalView.investment', 'Investment:') }}</span>
                <span class="font-bold text-ink">${{ Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ currency }}</span>
              </div>
            </div>

            <!-- Document Body Display -->
            <div class="bg-canvas rounded-xl border border-border/80 p-6 min-h-[620px]">
              <MarkdownRenderer :content="body" />
            </div>
          </div>

          <!-- Interactive Editor Mode (when Client clicks "Edit Proposal") -->
          <div v-else class="relative z-10 space-y-6">
            <!-- Document Header Row: Title & Amount Input -->
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
              <div class="flex-1">
                <input
                  v-model="title"
                  type="text"
                  class="w-full bg-transparent font-display text-xl sm:text-2xl font-bold tracking-tight text-ink placeholder:text-muted focus:outline-none border-none p-0"
                  :class="{ 'opacity-60 pointer-events-none': isViewingPast || proposal?.status === 'ACCEPTED' }"
                  :readonly="isViewingPast || proposal?.status === 'ACCEPTED'"
                  placeholder="Proposal Name..."
                />
              </div>

              <!-- Amount Badge Input -->
              <div class="flex items-center gap-2 rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm shrink-0 shadow-sm">
                <span class="text-muted font-medium">{{ t('portal.proposalView.estimated', 'Estimated:') }}</span>
                <span class="font-bold text-ink">$</span>
                <input
                  v-model.number="amount"
                  type="number"
                  step="100"
                  class="w-24 bg-transparent font-bold text-ink focus:outline-none p-0 border-none text-sm"
                  :class="{ 'opacity-60 pointer-events-none': isViewingPast || proposal?.status === 'ACCEPTED' }"
                  :readonly="isViewingPast || proposal?.status === 'ACCEPTED'"
                  placeholder="0.00"
                />
                <span class="font-semibold text-accent uppercase">{{ currency }}</span>
              </div>
            </div>

            <!-- Formatting Toolbar & Document Body Editor -->
            <div class="space-y-2 pt-1">
              <MarkdownToolbar textarea-id="portal-proposal-body-textarea" />
              <textarea
                id="portal-proposal-body-textarea"
                v-model="body"
                class="w-full min-h-[620px] resize-y rounded-xl border bg-canvas p-6 font-mono text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 border-border/80"
                :class="{ 'border-amber-500/30 border-dashed opacity-80 cursor-default': isViewingPast || proposal?.status === 'ACCEPTED' }"
                :readonly="isViewingPast || proposal?.status === 'ACCEPTED'"
                placeholder="Proposal document text..."
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Client Submit Revision Name Modal -->
    <BaseModal
      :open="versionModalOpen"
      :title="t('portal.proposalView.submitRevisionModalTitle', 'Submit Revision Request')"
      @close="versionModalOpen = false"
    >
      <div class="space-y-4 text-xs">
        <p class="text-muted leading-relaxed">
          {{ t('portal.proposalView.submitRevisionModalDesc', 'Describe the edits or scope adjustments you made. {freelancer} will be notified automatically.', { freelancer: portalInfo?.freelancer_name || 'Your freelancer' }) }}
        </p>

        <BaseInput
          v-model="versionName"
          :label="t('portal.proposalView.revisionSummaryLabel', 'Revision Summary')"
          :placeholder="t('portal.proposalView.revisionSummaryPlaceholder', 'e.g. Adjusted milestone 2 scope & pricing...')"
          required
        />
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="versionModalOpen = false">
          {{ t('common.actions.cancel', 'Cancel') }}
        </BaseButton>
        <BaseButton size="sm" :loading="suggestEdits.isPending.value" @click="handleSubmitRevisionConfirm">
          <Send class="h-3.5 w-3.5" />
          <span>{{ t('portal.proposalView.submitRevision', 'Submit Revision') }}</span>
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Unsaved Changes Modal -->
    <BaseModal
      :open="confirmDialogOpen"
      :title="t('portal.proposalView.unsavedModalTitle', 'Unsaved Changes')"
      persistent
      @close="() => { confirmDialogOpen = false; pendingViewVersion = null }"
    >
      <p class="text-xs text-muted leading-relaxed">
        {{ t('portal.proposalView.unsavedModalDesc', 'You have unsaved edits. What would you like to do before viewing this version?') }}
      </p>

      <template #footer>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="() => { confirmDialogOpen = false; pendingViewVersion = null }"
        >
          {{ t('common.actions.cancel', 'Cancel') }}
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="handleDiscardAndView">
          {{ t('portal.proposalView.discardAndView', 'Discard & View') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
