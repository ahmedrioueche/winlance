<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckCircle2, DollarSign, FileCheck, ShieldCheck } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  signProposal: []
}>()

const { t } = useI18n()
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

      <BaseButton v-if="!isAccepted" size="md" class="shadow-sm" @click="emit('signProposal')">
        <FileCheck class="h-4 w-4" />
        <span>{{ t('portal.signProposal', 'Sign & Accept Proposal') }}</span>
      </BaseButton>

      <div v-else class="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 class="h-4 w-4" />
        <span>Signed &amp; Formally Accepted</span>
      </div>
    </div>
  </div>
</template>
