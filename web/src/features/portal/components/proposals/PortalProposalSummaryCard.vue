<script setup lang="ts">
import { DollarSign, FileText } from 'lucide-vue-next'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-6">
    <div class="flex items-center justify-between border-b border-border/60 pb-4">
      <div class="flex items-center gap-2 font-display text-base font-bold text-ink">
        <FileText class="h-4 w-4 text-accent" />
        <span>Executive Statement of Work</span>
      </div>

      <div v-if="proposal?.amount" class="flex items-center gap-1 font-display text-lg font-bold text-ink">
        <DollarSign class="h-4 w-4 text-emerald-500" />
        <span>${{ Number(proposal.amount).toLocaleString() }} {{ proposal.currency }}</span>
      </div>
    </div>

    <div class="text-xs text-ink-soft leading-relaxed space-y-3 whitespace-pre-wrap">
      {{ proposal?.summary || proposal?.body || 'No summary text specified.' }}
    </div>
  </div>
</template>
