<script setup lang="ts">
import {
  ArrowLeft,
  Check,
  Eye,
  GitCompare,
  Globe,
  History,
  Link2,
  Loader2,
  RotateCcw,
  Save,
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
import { useToast } from '@/shared/toast/useToast'
import { computeSideBySideDiff } from '@/shared/utils/diff'

import {
  useCreateProposalVersionMutation,
  useProposalQuery,
  useUpdateProposalMutation,
} from '../queries'
import type { ProposalVersion } from '../types'

const { t, d } = useI18n()
const route = useRoute()
const toast = useToast()

const proposalId = computed(() => String(route.params.proposalId || route.params.id || ''))
const clientId = computed(() => String(route.params.id || ''))

const { data: proposal, isPending, isError, refetch } = useProposalQuery(proposalId)

const updateProposal = useUpdateProposalMutation()
const createVersion = useCreateProposalVersionMutation()

// ─── Document Form State ─────────────────────────────────────────
const title = ref('')
const amount = ref<number | string>(0)
const currency = ref('USD')
const body = ref('')
const currentStatus = ref('DRAFT')

// Last-saved state for dirty detection
const lastSaved = ref({ title: '', body: '', amount: 0 as number | string })

// Auto-save state
const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'unsaved'>('idle')
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// Normalized helper functions for dirty check
function normalizeText(str: string | null | undefined): string {
  return (str || '').replace(/\r\n/g, '\n').trim()
}

function normalizeNum(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

// ─── UI State ─────────────────────────────────────────────────────
const versionModalOpen = ref(false)
const versionName = ref('')
const confirmDialogOpen = ref(false)
const pendingViewVersion = ref<ProposalVersion | null>(null)
const isCopied = ref(false)

// Version viewing / comparison
const viewingVersion = ref<ProposalVersion | null>(null)
const comparingVersion = ref<ProposalVersion | null>(null)
const compareTargetId = ref<string>('current')

const isPostPublishStatus = computed(() => {
  const current = currentStatus.value
  return current !== 'DRAFT' && current !== 'READY'
})

const statusOptions = computed<SelectOption[]>(() => {
  const postPublish = isPostPublishStatus.value
  return [
    { value: 'DRAFT', label: 'Draft', disabled: postPublish },
    { value: 'READY', label: 'Ready', disabled: postPublish },
    { value: 'SENT', label: 'Sent' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'CHANGES_REQUESTED', label: 'Changes Requested' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'WITHDRAWN', label: 'Withdrawn' },
  ]
})

// ─── Populate form when proposal loads ───────────────────────────
watch(
  proposal,
  (val) => {
    if (val && !viewingVersion.value && !isDirty.value) {
      const incomingTitle = val.title || ''
      const incomingBody = val.body || ''
      const incomingAmount = val.amount ? Number(val.amount) : 0

      title.value = incomingTitle
      amount.value = incomingAmount
      currency.value = val.currency || 'USD'
      body.value = incomingBody
      currentStatus.value = val.status || 'DRAFT'
      lastSaved.value = {
        title: incomingTitle,
        body: incomingBody,
        amount: incomingAmount,
      }
    }
  },
  { immediate: true },
)

// ─── Computed ────────────────────────────────────────────────────
const versions = computed(() => proposal.value?.versions ?? [])
const hasVersions = computed(() => versions.value.length > 0)
const isViewingPast = computed(() => viewingVersion.value !== null)
const isComparing = computed(() => comparingVersion.value !== null)

const isDirty = computed(() => {
  if (viewingVersion.value) return false // Read-only past version viewing is never dirty

  const titleChanged = normalizeText(title.value) !== normalizeText(lastSaved.value.title)
  const bodyChanged = normalizeText(body.value) !== normalizeText(lastSaved.value.body)
  const amountChanged = normalizeNum(amount.value) !== normalizeNum(lastSaved.value.amount)

  return titleChanged || bodyChanged || amountChanged
})

// Debounced auto-save trigger
function scheduleAutoSave() {
  if (isViewingPast.value || !proposalId.value) return
  if (!isDirty.value) return

  autoSaveStatus.value = 'unsaved'

  if (autoSaveTimer) clearTimeout(autoSaveTimer)

  autoSaveTimer = setTimeout(async () => {
    if (!isDirty.value || isViewingPast.value || !proposalId.value) return
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

// Compare Target Options & Target Content
const compareTargetOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [
    { value: 'current', label: 'Current Working Draft' },
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
    return 'Current Working Draft'
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

// ─── Robust LCS Line Diff ───────────────────────────────────────
const diffLines = computed(() => {
  if (!comparingVersion.value) return { left: [], right: [] }
  return computeSideBySideDiff(comparingVersion.value.body, compareRightContent.value)
})

// ─── Actions ─────────────────────────────────────────────────────

/** Always persist content to server */
async function saveContent() {
  if (!proposalId.value) return
  await updateProposal.mutateAsync({
    id: proposalId.value,
    title: title.value.trim(),
    amount: Number(amount.value),
    currency: currency.value,
    body: body.value,
    status: currentStatus.value,
  })
  lastSaved.value = {
    title: title.value.trim(),
    body: body.value,
    amount: Number(amount.value),
  }
}

/** Main Save button handler */
async function handleSave() {
  try {
    await saveContent()

    if (hasVersions.value) {
      // Post-publish: content saved, now ask for version name
      versionName.value = ''
      versionModalOpen.value = true
    } else {
      // Pre-publish: silent save
      toast.success(t('proposals.messages.saved', 'Saved'))
    }
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** Version modal confirm */
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
    toast.success(t('proposals.messages.versionCreated', 'Version saved'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** Version modal skip — content already saved */
function handleVersionSkip() {
  versionModalOpen.value = false
  versionName.value = ''
  toast.success(t('proposals.messages.saved', 'Saved'))
}

/** Publish button */
async function handlePublish() {
  if (!proposalId.value) return
  try {
    // 1. Save content
    await saveContent()
    // 2. Create v1 "Published version"
    await createVersion.mutateAsync({
      id: proposalId.value,
      title: title.value.trim(),
      body: body.value,
      amount: Number(amount.value),
      change_summary: 'Published version',
    })
    // 3. Set status to SENT
    currentStatus.value = 'SENT'
    await updateProposal.mutateAsync({
      id: proposalId.value,
      status: 'SENT',
    })
    toast.success(t('proposals.messages.published', 'Proposal published'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** Status change from dropdown */
async function handleStatusChange() {
  if (!proposalId.value) return
  try {
    await updateProposal.mutateAsync({
      id: proposalId.value,
      status: currentStatus.value,
    })
    toast.success(t('proposals.messages.statusUpdated', 'Status updated'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

/** View a past version — with dirty check */
function handleViewVersion(ver: ProposalVersion) {
  if (isDirty.value) {
    pendingViewVersion.value = ver
    confirmDialogOpen.value = true
    return
  }
  enterVersionView(ver)
}

/** Dirty check: save & view */
async function handleSaveAndView() {
  confirmDialogOpen.value = false
  try {
    await saveContent()
    if (hasVersions.value) {
      // Auto-save without version modal in this flow
      toast.success(t('proposals.messages.saved', 'Saved'))
    }
  } catch (error) {
    toast.errorFromUnknown(error)
  }
  if (pendingViewVersion.value) enterVersionView(pendingViewVersion.value)
  pendingViewVersion.value = null
}

/** Dirty check: discard & view */
function handleDiscardAndView() {
  confirmDialogOpen.value = false
  // Restore last-saved values
  title.value = lastSaved.value.title
  body.value = lastSaved.value.body
  amount.value = lastSaved.value.amount
  if (pendingViewVersion.value) enterVersionView(pendingViewVersion.value)
  pendingViewVersion.value = null
}

/** Enter read-only version view */
function enterVersionView(ver: ProposalVersion) {
  viewingVersion.value = ver
  title.value = ver.title
  body.value = ver.body
  amount.value = Number(ver.amount)
}

/** Restore content from viewed version back into editor */
function handleRestore() {
  // Content from viewed version is already in the editor
  // Just exit read-only mode — user has unsaved changes
  viewingVersion.value = null
  // Don't update lastSaved — the content differs from server, so isDirty will be true
}

/** Back to latest — reload current proposal from server */
function handleBackToLatest() {
  viewingVersion.value = null
  if (proposal.value) {
    title.value = proposal.value.title || ''
    body.value = proposal.value.body || ''
    amount.value = proposal.value.amount ? Number(proposal.value.amount) : 0
    currentStatus.value = proposal.value.status || 'DRAFT'
  }
}

/** Compare version */
function handleCompare(ver: ProposalVersion) {
  comparingVersion.value = ver
  compareTargetId.value = 'current'
}

function handleCloseComparison() {
  comparingVersion.value = null
}

/** Share link */
function handleCopyShareLink() {
  const shareUrl = `${window.location.origin}/app/clients/${clientId.value}/proposals/${proposalId.value}`
  void navigator.clipboard.writeText(shareUrl)
  isCopied.value = true
  toast.success(t('proposals.messages.linkCopied', 'Share link copied!'))
  setTimeout(() => {
    isCopied.value = false
  }, 2500)
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
  const name = ver.created_by_name || ver.created_by_role
  if (ver.created_by_role === 'client' && ver.created_by_name) {
    return `${ver.created_by_name} (Client)`
  }
  return name
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

        <!-- Right: Comparison Target (Dropdown to select version vs version or current) -->
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

    <!-- ═══ NORMAL EDITOR MODE ═══ -->
    <template v-else>
      <!-- ─── Read-Only Version Banner ─── -->
      <div
        v-if="isViewingPast && viewingVersion"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
      >
        <div class="flex items-center gap-2">
          <Eye class="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span class="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Viewing v{{ viewingVersion.version_number }} — "{{ viewingVersion.change_summary }}"
          </span>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" @click="handleRestore">
            <RotateCcw class="h-3.5 w-3.5" />
            <span>Restore this version</span>
          </BaseButton>
          <BaseButton size="sm" @click="handleBackToLatest">
            Back to latest
          </BaseButton>
        </div>
      </div>

      <!-- ─── Header Control Bar ─── -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft">
        <div class="flex items-center gap-3 min-w-0">
          <RouterLink
            :to="`/app/clients/${clientId}/proposals`"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas hover:bg-canvas-muted text-ink transition-colors"
          >
            <ArrowLeft class="h-4 w-4" />
          </RouterLink>

          <div class="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
            <h1 class="font-display text-lg font-bold text-ink truncate max-w-xs sm:max-w-md">
              {{ title || 'Untitled Proposal' }}
            </h1>

            <div class="w-44 shrink-0">
              <BaseSelect
                v-model="currentStatus"
                label=""
                :options="statusOptions"
                :disabled="isViewingPast"
                @update:model-value="handleStatusChange"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- Auto-save Status Indicator -->
          <div v-if="!isViewingPast" class="me-1 hidden sm:flex items-center text-xs">
            <span v-if="autoSaveStatus === 'saving'" class="text-muted flex items-center gap-1.5 font-medium">
              <Loader2 class="h-3 w-3 animate-spin text-accent" />
              Auto-saving...
            </span>
            <span v-else-if="autoSaveStatus === 'saved'" class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <Check class="h-3 w-3" />
              Auto-saved
            </span>
            <span v-else-if="autoSaveStatus === 'unsaved'" class="text-muted font-medium">
              Unsaved changes
            </span>
          </div>

          <!-- Share Link Icon Button -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-muted hover:bg-canvas-muted hover:text-accent transition-colors"
            title="Copy share link"
            @click="handleCopyShareLink"
          >
            <Check v-if="isCopied" class="h-4 w-4 text-accent" />
            <Link2 v-else class="h-4 w-4" />
          </button>

          <!-- Save Button -->
          <BaseButton
            variant="secondary"
            size="sm"
            :loading="updateProposal.isPending.value"
            :disabled="isViewingPast"
            @click="handleSave"
          >
            <Save class="h-3.5 w-3.5" />
            <span>Save</span>
          </BaseButton>

          <!-- Publish Button (pre-publish only) -->
          <BaseButton
            v-if="!hasVersions"
            size="sm"
            :loading="createVersion.isPending.value"
            :disabled="isViewingPast"
            @click="handlePublish"
          >
            <Send class="h-3.5 w-3.5" />
            <span>Publish</span>
          </BaseButton>
        </div>
      </div>

      <!-- ─── Loading ─── -->
      <div v-if="isPending" class="space-y-6">
        <Skeleton class="h-[600px] w-full rounded-2xl" />
      </div>

      <!-- ─── Error ─── -->
      <ErrorState
        v-else-if="isError"
        class="mt-6"
        :title="t('common.errors.generic', 'Failed to load proposal')"
        :retry-label="t('common.actions.retry', 'Try again')"
        @retry="refetch()"
      />

      <!-- ─── Main Editor + Sidebar ─── -->
      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Document Canvas (8 cols) -->
        <div class="lg:col-span-8">
          <div
            class="relative rounded-2xl border bg-canvas-elevated p-6 sm:p-10 shadow-lift min-h-[750px] space-y-4"
            :class="isViewingPast ? 'border-amber-500/30 border-dashed' : 'border-border'"
          >
            <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-10 rounded-2xl" aria-hidden="true" />

            <!-- Document Header: Name + Amount -->
            <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
              <div class="flex-1">
                <input
                  v-model="title"
                  type="text"
                  class="w-full bg-transparent font-display text-lg sm:text-xl font-bold tracking-tight text-ink placeholder:text-muted focus:outline-none border-none p-0"
                  :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
                  :readonly="isViewingPast"
                  placeholder="Proposal Name..."
                />
              </div>

              <!-- Amount Badge -->
              <div class="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs shrink-0 shadow-sm">
                <span class="text-muted font-medium">Estimated:</span>
                <span class="font-bold text-ink">$</span>
                <input
                  v-model.number="amount"
                  type="number"
                  step="100"
                  class="w-24 bg-transparent font-bold text-ink focus:outline-none p-0 border-none text-sm"
                  :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
                  :readonly="isViewingPast"
                  placeholder="0.00"
                />
                <span class="font-semibold text-accent uppercase">USD</span>
              </div>
            </div>

            <!-- Body Editor -->
            <div class="relative z-10 pt-2">
              <textarea
                v-model="body"
                class="w-full min-h-[620px] resize-y rounded-xl border bg-canvas p-6 font-mono text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                :class="isViewingPast ? 'border-amber-500/30 border-dashed opacity-80 cursor-default' : 'border-border/80'"
                :readonly="isViewingPast"
                placeholder="Write or paste your proposal content here..."
              />
            </div>
          </div>
        </div>

        <!-- Sidebar: Version Browser (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <div class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-4">
            <!-- Sidebar Header -->
            <div class="flex items-center justify-between">
              <span class="font-display text-sm font-bold text-ink flex items-center gap-1.5">
                <History class="h-4 w-4 text-accent" />
                Versions
                <span v-if="versions.length > 0" class="text-muted font-normal">({{ versions.length }})</span>
              </span>
            </div>

            <!-- Empty State -->
            <div
              v-if="versions.length === 0"
              class="rounded-lg border border-border bg-canvas p-5 text-center space-y-1"
            >
              <p class="text-sm font-medium text-muted">No versions yet</p>
              <p class="text-xs text-muted/70 leading-relaxed">
                Versions are created when you publish or save changes to a published proposal.
              </p>
            </div>

            <!-- Version Cards -->
            <div v-else class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              <div
                v-for="ver in versions"
                :key="ver.id"
                class="rounded-lg border p-3.5 text-xs transition-all duration-150"
                :class="
                  viewingVersion?.id === ver.id
                    ? 'border-accent bg-accent-soft shadow-sm'
                    : 'border-border bg-canvas hover:border-accent/30'
                "
              >
                <!-- Version Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-ink">v{{ ver.version_number }}</span>
                    <span
                      v-if="viewingVersion?.id === ver.id"
                      class="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                    >
                      Viewing
                    </span>
                    <span
                      v-else-if="ver.version_number === versions[0]?.version_number"
                      class="text-[10px] font-normal text-muted"
                    >
                      (latest)
                    </span>
                  </div>
                  <span
                    class="rounded bg-canvas-muted px-2 py-0.5 text-[10px] font-medium uppercase"
                    :class="ver.created_by_role === 'client' ? 'text-purple-600 dark:text-purple-400' : 'text-muted'"
                  >
                    {{ ver.created_by_role }}
                  </span>
                </div>

                <!-- Version Info -->
                <p class="text-ink-soft mt-1.5 font-medium truncate">
                  "{{ ver.change_summary }}"
                </p>
                <p class="text-muted mt-0.5">
                  {{ formatAuthor(ver) }} · {{ formatDate(ver.created_at) }}
                </p>

                <!-- Actions -->
                <div class="mt-2.5 pt-2 border-t border-border/60 flex items-center gap-2">
                  <button
                    class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
                    @click="handleViewVersion(ver)"
                  >
                    <Eye class="h-3 w-3" />
                    <span>View</span>
                  </button>
                  <button
                    class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
                    @click="handleCompare(ver)"
                  >
                    <GitCompare class="h-3 w-3" />
                    <span>Compare</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ VERSION NAME MODAL ═══ -->
    <BaseModal
      :open="versionModalOpen"
      title="Save New Version"
      @close="handleVersionSkip"
    >
      <div class="space-y-4">
        <p class="text-sm text-muted leading-relaxed">
          Your changes have been saved. Name this version to keep it in your history.
        </p>
        <BaseInput
          v-model="versionName"
          label="What changed?"
          placeholder="e.g. Updated scope & pricing"
        />
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="handleVersionSkip">
          Skip — content saved
        </BaseButton>
        <BaseButton size="sm" :loading="createVersion.isPending.value" @click="handleVersionConfirm">
          Save Version
        </BaseButton>
      </template>
    </BaseModal>

    <!-- ═══ UNSAVED CHANGES CONFIRMATION MODAL ═══ -->
    <BaseModal
      :open="confirmDialogOpen"
      title="Unsaved Changes"
      persistent
      @close="() => { confirmDialogOpen = false; pendingViewVersion = null }"
    >
      <p class="text-sm text-muted leading-relaxed">
        You have unsaved changes. What would you like to do before viewing this version?
      </p>

      <template #footer>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="() => { confirmDialogOpen = false; pendingViewVersion = null }"
        >
          Cancel
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="handleDiscardAndView">
          Discard & View
        </BaseButton>
        <BaseButton size="sm" :loading="updateProposal.isPending.value" @click="handleSaveAndView">
          Save & View
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
