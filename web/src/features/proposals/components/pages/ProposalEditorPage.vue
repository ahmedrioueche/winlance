<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useClientQuery } from '@/features/client-dashboard/queries'
import { useCreateProposalMutation } from '../../queries'
import { useProposalEditorState } from '../../composables/editor/useProposalEditorState'
import { useProposalSaveActions } from '../../composables/editor/useProposalSaveActions'
import ProposalDeleteModal from '../editor/ProposalDeleteModal.vue'
import ProposalEditorClientSection from '../editor/ProposalEditorClientSection.vue'
import ProposalEditorHeader from '../editor/ProposalEditorHeader.vue'
import ProposalEditorScopeSection from '../editor/ProposalEditorScopeSection.vue'
import ProposalEditorTotalsCard from '../editor/ProposalEditorTotalsCard.vue'

const route = useRoute()
const router = useRouter()
const proposalId = computed(() => String(route.params.proposalId || route.params.id || ''))
const clientId = computed(() => String(route.query.client_id || route.params.id || ''))

const createProposalMutation = useCreateProposalMutation()

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

const { data: client } = useClientQuery(clientId)

const {
  proposal,
  isPending,
  isError,
  refetch,
  title,
  summary,
  amount,
  currency,
  targetProjectName,
  isSaving,
  handleSaveProposal,
  handlePublishProposal,
} = useProposalEditorState(proposalId)

const {
  isDeleteModalOpen,
  confirmDeleteText,
  isDeleteConfirmed,
  isDeleting,
  isCreatingProject,
  handleOpenDeleteModal,
  handleConfirmDeleteProposal,
  handleCreateProjectWorkspace,
} = useProposalSaveActions(proposalId, clientId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-48 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load proposal editor"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ProposalEditorHeader
      :proposal="proposal"
      :is-saving="isSaving"
      :is-creating-project="isCreatingProject"
      @save="handleSaveProposal"
      @publish="handlePublishProposal"
      @create-project="handleCreateProjectWorkspace"
      @delete="handleOpenDeleteModal"
    />

    <ProposalEditorClientSection :client="client" />

    <ProposalEditorScopeSection
      v-model:title="title"
      v-model:target-project-name="targetProjectName"
      v-model:summary="summary"
    />

    <ProposalEditorTotalsCard
      v-model:amount="amount"
      v-model:currency="currency"
    />

    <!-- Delete Modal -->
    <ProposalDeleteModal
      v-model:confirm-text="confirmDeleteText"
      :open="isDeleteModalOpen"
      :proposal-title="proposal?.title || ''"
      :is-deleting="isDeleting"
      :is-confirmed="isDeleteConfirmed"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDeleteProposal(proposal?.title || '')"
    />
  </section>
</template>
