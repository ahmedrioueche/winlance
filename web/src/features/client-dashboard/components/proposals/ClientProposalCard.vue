<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import type { ClientProposal } from '../../types'

interface Props {
  proposal: ClientProposal
}

defineProps<Props>()
</script>

<template>
  <div
    class="group rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-4 cursor-pointer hover:border-accent/40 hover:shadow-lift transition-all"
    @click="$router.push(`/app/proposals/${proposal.id}`)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 truncate">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-500 shrink-0">
          <FileText class="h-5 w-5" />
        </div>
        <div class="truncate">
          <h3 class="font-bold text-ink text-base truncate group-hover:text-purple-500 transition-colors">
            {{ proposal.title }}
          </h3>
          <span
            class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
            :class="proposal.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'"
          >
            {{ proposal.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
      <span v-if="proposal.amount" class="font-semibold text-ink">
        ${{ Number(proposal.amount).toLocaleString() }} USD
      </span>
      <span class="text-accent font-medium text-[11px] group-hover:underline">
        Open Proposal →
      </span>
    </div>
  </div>
</template>
