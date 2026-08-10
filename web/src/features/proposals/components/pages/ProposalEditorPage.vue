<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ErrorState, Skeleton } from '@/shared/components/base'
import { useClientQuery } from '@/features/client-dashboard/queries'
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
import ProposalSmartImportModal from '../editor/ProposalSmartImportModal.vue'
import ProposalUnsavedChangesModal from '../editor/ProposalUnsavedChangesModal.vue'
import ProposalVersionSaveModal from '../editor/ProposalVersionSaveModal.vue'

const route = useRoute()
const router = useRouter()

const proposalId = computed(() => String(route.params.proposalId || route.params.id || ''))
const clientId = computed(() => String(route.query.client_id || route.params.id || ''))

const { data: client } = useClientQuery(clientId)

const smartImportModalOpen = ref(false)
const versionDrawerOpen = ref(false)

const {
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

const portalShareUrl = computed(() => {
  if (client.value?.portal_token && proposalId.value) {
    return `${window.location.origin}/portal/${client.value.portal_token}/proposals/${proposalId.value}`
  }
  return `${window.location.origin}/app/clients/${clientId.value}/proposals/${proposalId.value}`
})
</script>

<template>
  <div class="min-h-screen space-y-6 relative">
    <!-- ═══ FULL-WIDTH DIFF COMPARISON MODE ═══ -->
    <template v-if="isComparing && comparingVersion">
      <ProposalEditorDiffView
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
    </template>

    <!-- ═══ NORMAL EDITOR MODE ═══ -->
    <template v-else>
      <!-- ─── Read-Only Version Banner ─── -->
      <ProposalEditorReadonlyBanner
        v-if="isViewingPast && viewingVersion"
        :version="viewingVersion"
        @restore="handleRestore"
        @back-to-latest="handleBackToLatest"
      />

      <!-- ─── Header Control Bar ─── -->
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

      <!-- ─── Loading ─── -->
      <div v-if="isPending" class="space-y-6">
        <Skeleton class="h-[600px] w-full rounded-2xl" />
      </div>

      <!-- ─── Error ─── -->
      <ErrorState
        v-else-if="isError"
        class="mt-6"
        title="Failed to load proposal editor"
        retry-label="Try again"
        @retry="refetch()"
      />

      <!-- ─── Side-by-Side 2-Column Grid Layout ─── -->
      <div v-else class="relative">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full items-start">
          <!-- Left Column (50%): Document Copy (Summary & Terms) -->
          <div class="space-y-6">
            <ProposalEditorDocumentCanvas
              v-model:title="title"
              v-model:summary="summary"
              v-model:amount="amount"
              v-model:currency="currency"
              v-model:body="body"
              :is-viewing-past="isViewingPast"
            />
          </div>

          <!-- Right Column (50%): Structured Milestone Breakdown -->
          <div class="space-y-6">
            <ProposalEditorMilestonesSection
              v-model:milestones="milestones"
              :total-proposal-amount="Number(amount)"
              :is-viewing-past="isViewingPast"
            />
          </div>
        </div>

        <!-- 📜 Collapsible Version History Slide-Over Drawer -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div
            v-if="versionDrawerOpen && versions.length > 0"
            class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-canvas-elevated p-6 shadow-lift border-l border-border flex flex-col justify-between"
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

        <!-- Backdrop overlay when drawer is open -->
        <div
          v-if="versionDrawerOpen && versions.length > 0"
          class="fixed inset-0 z-40 bg-ink/20 backdrop-blur-xs"
          @click="versionDrawerOpen = false"
        />
      </div>
    </template>

    <!-- ═══ MODALS ═══ -->
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
