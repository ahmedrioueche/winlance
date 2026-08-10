<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { ErrorState, Skeleton } from '@/shared/components/base'
import { useProposalComparison } from '../../composables/editor/useProposalComparison'
import { useProposalEditorState } from '../../composables/editor/useProposalEditorState'
import type { ProposalVersion, SmartImportResult } from '../../types'

// Sub-components
import ProposalDeleteModal from '../editor/ProposalDeleteModal.vue'
import ProposalEditorDiffView from '../editor/ProposalEditorDiffView.vue'
import ProposalEditorDocumentCanvas from '../editor/ProposalEditorDocumentCanvas.vue'
import ProposalEditorHeader from '../editor/ProposalEditorHeader.vue'
import ProposalEditorMilestonesSection from '../editor/ProposalEditorMilestonesSection.vue'
import ProposalEditorReadonlyBanner from '../editor/ProposalEditorReadonlyBanner.vue'
import ProposalEditorVersionSidebar from '../editor/ProposalEditorVersionSidebar.vue'
import ProposalOverviewCard from '../editor/ProposalOverviewCard.vue'
import ProposalSmartImportModal from '../editor/ProposalSmartImportModal.vue'
import ProposalUnsavedChangesModal from '../editor/ProposalUnsavedChangesModal.vue'
import ProposalVersionSaveModal from '../editor/ProposalVersionSaveModal.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const proposalId = computed(() => String(route.params.proposalId || route.params.id || ''))
const clientId = computed(() => String(route.query.client_id || route.params.id || ''))

const versionDrawerOpen = ref(false)
const smartImportModalOpen = ref(false)

const {
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
  milestones,
  viewingVersion,
  isViewingPast,
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
  handleSave,
  handleVersionConfirm,
  handleVersionSkip,
  handlePublish,
  handleStatusChange,
  handleViewVersion: rawHandleViewVersion,
  handleSaveAndView,
  handleDiscardAndView,
  handleRestore,
  handleBackToLatest,
  handleCreateProject,
  handleConfirmDelete,
} = useProposalEditorState(proposalId, clientId)

const {
  comparingVersion,
  compareTargetId,
  isComparing,
  compareTargetOptions,
  compareRightLabel,
  compareRightTitle,
  compareRightAmount,
  compareRightCurrency,
  leftAmount,
  leftCurrency,
  leftTitle,
  amountDiff,
  hasAmountDiff,
  hasTitleDiff,
  diffLines,
  handleCompare: rawHandleCompare,
  handleCloseComparison,
} = useProposalComparison(
  proposal,
  versions,
  title,
  body,
  amount,
  currency,
)

function handleViewVersion(ver: ProposalVersion) {
  rawHandleViewVersion(ver)
  versionDrawerOpen.value = false
}

function handleCompare(ver: ProposalVersion) {
  rawHandleCompare(ver)
  versionDrawerOpen.value = false
}

onMounted(async () => {
  if (proposalId.value === 'new') {
    try {
      const newProp = await createProposalMutation.mutateAsync({
        title: 'New Proposal',
        summary: '',
        amount: 0,
        currency: 'USD',
        status: 'DRAFT',
      })
      if (route.path.includes('/app/clients/')) {
        const pathClientId = route.params.id || clientId.value
        void router.replace({
          name: 'client-workspace-proposal-editor',
          params: { id: pathClientId, proposalId: newProp.id },
        })
      } else {
        void router.replace({ name: 'proposal-detail', params: { id: newProp.id } })
      }
    } catch {
      // error handled by mutation toast
    }
  }
})

function handleSmartImported(result: SmartImportResult) {
  if (result.title) title.value = result.title
  if (result.summary) summary.value = result.summary
  if (result.body) body.value = result.body
  if (result.amount) amount.value = result.amount
  if (result.currency) currency.value = result.currency
  if (result.milestones && result.milestones.length > 0) {
    milestones.value = result.milestones
  }
}
</script>

<template>
  <div class="space-y-6 min-h-screen pb-16">
    <!-- Readonly Version Banner (Visible when viewing past version) -->
    <ProposalEditorReadonlyBanner
      v-if="viewingVersion && isViewingPast"
      :version="viewingVersion"
      @restore="handleRestore"
      @back-to-latest="handleBackToLatest"
    />

    <!-- Comparison View (replaces main layout when comparing versions) -->
    <ProposalEditorDiffView
      v-if="isComparing && comparingVersion"
      v-model:compare-target-id="compareTargetId"
      :comparing-version="comparingVersion"
      :compare-target-options="compareTargetOptions"
      :compare-right-label="compareRightLabel"
      :compare-right-title="compareRightTitle"
      :compare-right-amount="compareRightAmount"
      :compare-right-currency="compareRightCurrency"
      :left-amount="leftAmount"
      :left-currency="leftCurrency"
      :left-title="leftTitle"
      :amount-diff="amountDiff"
      :has-amount-diff="hasAmountDiff"
      :has-title-diff="hasTitleDiff"
      :diff-lines="diffLines"
      @close="handleCloseComparison"
    />

    <!-- Main Workspace Layout (When NOT comparing) -->
    <template v-else>
      <!-- Top Action Header -->
      <ProposalEditorHeader
        v-model:current-status="currentStatus"
        :proposal="proposal"
        :title="title"
        :client-id="clientId"
        :proposal-id="proposalId"
        :is-viewing-past="isViewingPast"
        :has-versions="hasVersions"
        :versions-count="versions.length"
        :is-saving="updateProposal.isPending.value"
        :is-creating-project="createProjectMutation.isPending.value"
        :is-publishing="createVersion.isPending.value"
        :auto-save-status="autoSaveStatus"
        :portal-share-url="portalShareUrl"
        @status-change="handleStatusChange"
        @save="handleSave"
        @publish="handlePublish"
        @create-project="handleCreateProject"
        @open-project="router.push(`/app/projects/${$event}/overview`)"
        @open-delete-modal="deleteModalOpen = true"
        @open-smart-import-modal="smartImportModalOpen = true"
        @toggle-version-drawer="versionDrawerOpen = !versionDrawerOpen"
      />

      <!-- Loading State Skeleton -->
      <div v-if="isPending" class="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full items-start">
        <!-- Left Column Skeleton (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <Skeleton class="h-24 w-full rounded-2xl" />
          <Skeleton class="h-[520px] w-full rounded-2xl" />
        </div>
        <!-- Right Column Skeleton (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <Skeleton class="h-[630px] w-full rounded-2xl" />
        </div>
      </div>

      <!-- Error State -->
      <ErrorState
        v-else-if="isError"
        class="mt-6"
        :title="t('proposals.editor.errorTitle', 'Failed to load proposal editor')"
        :retry-label="t('common.actions.retry', 'Try again')"
        @retry="refetch()"
      />

      <!-- Primary Milestones (Left - 7 cols) & Summary/Terms (Right - 5 cols) Layout -->
      <div v-else class="relative">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full items-start">
          <!-- Left Column (7 cols): Proposal Title, Total Budget & Milestones Breakdown (PRIMARY) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Dedicated Proposal Title & Total Budget Card -->
            <ProposalOverviewCard
              v-model:title="title"
              v-model:amount="amount"
              v-model:currency="currency"
              :is-viewing-past="isViewingPast"
            />

            <!-- Main Milestones & Deliverables Breakdown Card -->
            <ProposalEditorMilestonesSection
              v-model:milestones="milestones"
              :total-proposal-amount="Number(amount)"
              :is-viewing-past="isViewingPast"
            />
          </div>

          <!-- Right Column (5 cols): Document Copy (Executive Summary & Terms) -->
          <div class="lg:col-span-5 space-y-6">
            <ProposalEditorDocumentCanvas
              v-model:summary="summary"
              v-model:body="body"
              :title="title"
              :is-viewing-past="isViewingPast"
              :milestones="milestones"
            />
          </div>
        </div>

        <!-- Collapsible Version History Slide-Over Drawer -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div
            v-if="versionDrawerOpen"
            class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-canvas p-6 shadow-2xl border-l border-border overflow-y-auto"
          >
            <ProposalEditorVersionSidebar
              :versions="versions"
              :viewing-version-id="viewingVersion?.id"
              @view="handleViewVersion"
              @compare="handleCompare"
              @close="versionDrawerOpen = false"
            />
          </div>
        </Transition>
      </div>
    </template>

    <!-- Modals -->
    <ProposalSmartImportModal
      :open="smartImportModalOpen"
      @close="smartImportModalOpen = false"
      @imported="handleSmartImported"
    />

    <ProposalVersionSaveModal
      v-model:version-name="versionName"
      :open="versionModalOpen"
      :is-pending="createVersion.isPending.value"
      @confirm="handleVersionConfirm"
      @skip="handleVersionSkip"
    />

    <ProposalUnsavedChangesModal
      :open="confirmDialogOpen"
      :is-pending="updateProposal.isPending.value"
      @close="confirmDialogOpen = false"
      @discard-and-view="handleDiscardAndView"
      @save-and-view="handleSaveAndView"
    />

    <ProposalDeleteModal
      v-model:confirm-text="confirmDeleteText"
      :open="deleteModalOpen"
      :is-deleting="deleteProposalMutation.isPending.value"
      @close="deleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
