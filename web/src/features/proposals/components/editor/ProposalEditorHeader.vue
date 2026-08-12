<script setup lang="ts">
import {
  ArrowLeft,
  Check,
  Clock,
  Download,
  Folder,
  FolderPlus,
  History,
  Link2,
  Loader2,
  Save,
  Send,
  Trash2,
  Wand2,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { useToast } from '@/shared/toast/useToast'
import type { Proposal } from '../../types'

interface Props {
  proposal?: Proposal
  title: string
  currentStatus: string
  clientId?: string
  proposalId: string
  isViewingPast: boolean
  hasVersions: boolean
  versionsCount?: number
  isSaving: boolean
  isCreatingProject: boolean
  isPublishing: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'unsaved'
  isExporting: boolean
  portalShareUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentStatus': [val: string]
  statusChange: []
  save: []
  publish: []
  createProject: []
  openProject: [projectId: string]
  openDeleteModal: []
  openSmartImportModal: []
  toggleVersionDrawer: []
  exportPdf: []
}>()

const { t } = useI18n()
const isCopied = ref(false)
const toast = useToast()

const isPostPublishStatus = computed(() => {
  const current = props.currentStatus
  return current !== 'DRAFT' && current !== 'READY'
})

const statusOptions = computed<SelectOption[]>(() => {
  const postPublish = isPostPublishStatus.value
  return [
    { value: 'DRAFT', label: t('proposals.status.DRAFT', 'Draft'), disabled: postPublish },
    { value: 'READY', label: t('proposals.status.READY', 'Ready'), disabled: postPublish },
    { value: 'SENT', label: t('proposals.status.SENT', 'Sent') },
    { value: 'UNDER_REVIEW', label: t('proposals.status.UNDER_REVIEW', 'Under Review') },
    { value: 'CHANGES_REQUESTED', label: t('proposals.status.CHANGES_REQUESTED', 'Changes Requested') },
    { value: 'ACCEPTED', label: t('proposals.status.ACCEPTED', 'Accepted') },
    { value: 'REJECTED', label: t('proposals.status.REJECTED', 'Rejected') },
    { value: 'EXPIRED', label: t('proposals.status.EXPIRED', 'Expired') },
    { value: 'WITHDRAWN', label: t('proposals.status.WITHDRAWN', 'Withdrawn') },
  ]
})

async function handleCopyShareLink() {
  const urlToCopy = props.portalShareUrl || `${window.location.origin}/portal/proposals/${props.proposalId}`
  if (!urlToCopy || props.proposalId === 'new') return

  try {
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
    isCopied.value = true
    toast.success(t('proposals.editor.linkCopied', 'Client Portal proposal share link copied!'))
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    toast.errorFromUnknown(err)
  }
}

const backLink = computed(() => {
  if (props.clientId) {
    return `/app/clients/${props.clientId}/proposals`
  }
  return '/app/proposals'
})
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft">
    <div class="flex items-center gap-3 min-w-0">
      <RouterLink
        :to="backLink"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas hover:bg-canvas-muted text-ink transition-colors"
        :title="t('proposals.editor.back', 'Back to proposals')"
      >
        <ArrowLeft class="h-4 w-4" />
      </RouterLink>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        <h1 class="font-display text-lg font-bold text-ink truncate max-w-xs sm:max-w-md">
          {{ title || t('proposals.editor.untitled', 'Untitled Proposal') }}
        </h1>

        <div class="w-44 shrink-0">
          <BaseSelect
            :model-value="currentStatus"
            label=""
            :options="statusOptions"
            :disabled="isViewingPast"
            @update:model-value="emit('update:currentStatus', $event); emit('statusChange')"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex shrink-0 items-center gap-2">
      <!-- Auto-save Status Indicator -->
      <div
        v-if="autoSaveStatus !== 'idle' && !isViewingPast"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-xs shrink-0"
      >
        <span v-if="autoSaveStatus === 'saving'" :title="t('common.saving', 'Auto-saving...')">
          <Loader2 class="h-4 w-4 animate-spin text-accent" />
        </span>
        <span v-else-if="autoSaveStatus === 'saved'" :title="t('common.saved', 'Auto-saved')">
          <Check class="h-4 w-4 text-emerald-500" />
        </span>
        <span v-else-if="autoSaveStatus === 'unsaved'" :title="t('common.unsaved', 'Unsaved changes')">
          <Clock class="h-4 w-4 text-amber-500" />
        </span>
      </div>

      <!-- Share Link Icon Button -->
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-muted hover:bg-canvas-muted hover:text-accent transition-colors"
        :title="t('proposals.editor.copyLink', 'Copy share link')"
        @click="handleCopyShareLink"
      >
        <Check v-if="isCopied" class="h-4 w-4 text-accent" />
        <Link2 v-else class="h-4 w-4" />
      </button>

      <!-- Export PDF Icon Button -->
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-muted hover:bg-canvas-muted hover:text-accent transition-colors disabled:opacity-50"
        :title="t('proposals.editor.exportPdf', 'Export as PDF')"
        :disabled="isExporting"
        @click="emit('exportPdf')"
      >
        <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin text-accent" />
        <Download v-else class="h-4 w-4" />
      </button>

      <!-- Delete Proposal Icon Button -->
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas text-muted hover:bg-canvas-muted hover:text-red-500 transition-colors"
        :title="t('proposals.editor.deleteProposal', 'Delete proposal')"
        @click="emit('openDeleteModal')"
      >
        <Trash2 class="h-4 w-4" />
      </button>

      <!-- Smart AI Import Button -->
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="isViewingPast"
        class="border-accent/30 bg-accent/5 text-accent hover:bg-accent/10"
        @click="emit('openSmartImportModal')"
      >
        <Wand2 class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.aiImport', '✨ AI Import') }}</span>
      </BaseButton>

      <!-- History Drawer Toggle Button (Only if versions exist) -->
      <BaseButton
        v-if="versionsCount && versionsCount > 0"
        variant="secondary"
        size="sm"
        @click="emit('toggleVersionDrawer')"
      >
        <History class="h-3.5 w-3.5 text-accent" />
        <span>{{ t('proposals.editor.history', 'History') }}</span>
        <span class="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent ms-1">
          {{ versionsCount }}
        </span>
      </BaseButton>

      <!-- Save Button -->
      <BaseButton
        variant="secondary"
        size="sm"
        :loading="isSaving"
        :disabled="isViewingPast"
        @click="emit('save')"
      >
        <Save class="h-3.5 w-3.5" />
        <span>{{ t('common.actions.save', 'Save') }}</span>
      </BaseButton>

      <!-- Open Existing Project Workspace Button -->
      <BaseButton
        v-if="currentStatus === 'ACCEPTED' && proposal?.project_id"
        size="sm"
        variant="secondary"
        @click="emit('openProject', proposal.project_id!)"
      >
        <Folder class="h-3.5 w-3.5 text-accent" />
        <span>{{ t('proposals.editor.openProjectWorkspace', 'Open Project Workspace') }}</span>
      </BaseButton>

      <!-- Create Project Button -->
      <BaseButton
        v-else-if="currentStatus === 'ACCEPTED'"
        size="sm"
        :loading="isCreatingProject"
        @click="emit('createProject')"
      >
        <FolderPlus class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.createProject', 'Create Project') }}</span>
      </BaseButton>

      <!-- Publish Button -->
      <BaseButton
        v-else-if="!hasVersions"
        size="sm"
        :loading="isPublishing"
        :disabled="isViewingPast"
        @click="emit('publish')"
      >
        <Send class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.publishBtn', 'Publish') }}</span>
      </BaseButton>
    </div>
  </div>
</template>
