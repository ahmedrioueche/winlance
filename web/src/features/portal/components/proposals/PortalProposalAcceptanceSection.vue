<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, CheckCircle2, DollarSign, Edit3, FileCheck, ShieldCheck } from 'lucide-vue-next'
import { BaseButton, BaseModal } from '@/shared/components/base'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  signProposal: []
  requestChanges: [notes: string]
}>()

const { t } = useI18n()
const requestModalOpen = ref(false)
const feedbackNotes = ref('')

function handleConfirmRequestChanges() {
  if (!feedbackNotes.value.trim()) return
  emit('requestChanges', feedbackNotes.value.trim())
  requestModalOpen.value = false
  feedbackNotes.value = ''
}
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <div>
          <h3 class="font-display text-base font-bold text-ink">
            Formal Proposal Sign-Off &amp; Acceptance
          </h3>
          <p class="text-xs text-muted">
            Authorized approval &amp; agreement verification
          </p>
        </div>
      </div>

      <div v-if="proposal?.amount" class="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
        <DollarSign class="h-4 w-4" />
        <span>Total Investment: ${{ Number(proposal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal.currency || 'USD' }}</span>
      </div>
    </div>

    <!-- Client Feedback Banner if revision was requested -->
    <div
      v-if="proposal?.status === 'CHANGES_REQUESTED' && proposal?.client_feedback"
      class="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs space-y-1 text-purple-600 dark:text-purple-400"
    >
      <div class="flex items-center gap-2 font-bold">
        <Edit3 class="h-4 w-4" />
        <span>Revision Requested</span>
      </div>
      <p class="text-[11px] opacity-90 italic">"{{ proposal.client_feedback }}"</p>
    </div>

    <div class="rounded-xl border border-border/70 bg-canvas p-4 text-xs text-ink-soft leading-relaxed space-y-2">
      <p>
        By signing and accepting this proposal, you confirm that you have reviewed the executive statement of work, milestone schedule, and scope terms listed above.
      </p>
      <p class="text-muted text-[11px]">
        Upon digital acceptance, your freelancer will be notified immediately to kick off project deliverables.
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
      <div class="text-xs text-muted">
        <span>Status: </span>
        <span
          class="font-semibold uppercase"
          :class="isAccepted ? 'text-emerald-500' : 'text-accent'"
        >
          {{ proposal?.status || 'READY' }}
        </span>
      </div>

      <div v-if="!isAccepted && !proposal?.is_expired" class="flex items-center gap-3">
        <BaseButton variant="secondary" size="md" @click="requestModalOpen = true">
          <Edit3 class="h-4 w-4 text-purple-500" />
          <span>Request Changes</span>
        </BaseButton>

        <BaseButton size="md" class="shadow-sm" @click="emit('signProposal')">
          <FileCheck class="h-4 w-4" />
          <span>{{ t('portal.signProposal', 'Sign & Accept Proposal') }}</span>
        </BaseButton>
      </div>

      <div v-else-if="isAccepted" class="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 class="h-4 w-4" />
        <span>Signed &amp; Formally Accepted</span>
      </div>
    </div>

    <!-- Request Changes Modal -->
    <BaseModal
      v-model="requestModalOpen"
      title="Request Proposal Changes"
      description="Specify any adjustments or clarification needed before signing."
    >
      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-ink mb-1.5">Revision Details / Requested Edits:</label>
          <textarea
            v-model="feedbackNotes"
            rows="4"
            placeholder="e.g. Please update Milestone 2 timeline to start on Sept 1st and clarify API deployment scope..."
            class="w-full rounded-xl border border-border bg-canvas p-3 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" size="sm" @click="requestModalOpen = false">
            Cancel
          </BaseButton>
          <BaseButton size="sm" :disabled="!feedbackNotes.trim()" @click="handleConfirmRequestChanges">
            Submit Revision Request
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
