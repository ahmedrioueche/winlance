<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import { CheckSquare, DollarSign, FileText, Layers, ShieldCheck, Sparkles } from 'lucide-vue-next'
import type { Proposal } from '@/features/proposals/types'
import PortalProposalAcceptanceSection from './PortalProposalAcceptanceSection.vue'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  signProposal: []
}>()

const renderedBodyHtml = computed(() => {
  const md = props.proposal?.body || ''
  if (!md.trim()) return ''
  return marked.parse(md, { async: false }) as string
})

const milestonesList = computed(() => {
  return props.proposal?.milestones || []
})

const milestoneSum = computed(() => {
  return milestonesList.value.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Executive Statement & Investment Summary Card -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div class="flex items-center gap-2 font-display text-base font-bold text-ink">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText class="h-4 w-4" />
          </div>
          <div>
            <h3>Executive Statement of Work</h3>
            <p class="text-xs font-normal text-muted">Core proposal overview &amp; requirements</p>
          </div>
        </div>

        <div v-if="proposal?.amount" class="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <DollarSign class="h-4 w-4" />
          <span>${{ Number(proposal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal.currency || 'USD' }}</span>
        </div>
      </div>

      <div class="text-xs text-ink-soft leading-relaxed whitespace-pre-wrap">
        {{ proposal?.summary || 'No summary text specified for this proposal.' }}
      </div>
    </div>

    <!-- Milestones Roadmap & Deliverables Checklist Grid -->
    <div v-if="milestonesList.length > 0" class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
      <div class="flex items-center justify-between border-b border-border/60 pb-3">
        <div class="flex items-center gap-2 font-display text-sm font-bold text-ink">
          <Sparkles class="h-4 w-4 text-accent" />
          <span>Milestones &amp; Phase Roadmap ({{ milestonesList.length }} Phases)</span>
        </div>

        <span v-if="milestoneSum > 0" class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Total Milestones: ${{ milestoneSum.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal?.currency || 'USD' }}
        </span>
      </div>

      <div class="space-y-4">
        <div
          v-for="(m, idx) in milestonesList"
          :key="m.id || idx"
          class="rounded-xl border border-border bg-canvas p-4 space-y-3"
        >
          <div class="flex flex-wrap items-start justify-between gap-2 border-b border-border/50 pb-2.5">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                  Phase {{ idx + 1 }}
                </span>
                <h4 class="font-display text-xs font-bold text-ink">
                  {{ m.title || `Phase ${idx + 1}` }}
                </h4>
              </div>
              <p v-if="m.description" class="text-muted text-[11px] leading-relaxed">
                {{ m.description }}
              </p>
            </div>

            <span v-if="Number(m.amount)" class="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              ${{ Number(m.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>

          <!-- Deliverables Checklist -->
          <div v-if="m.deliverables && m.deliverables.length > 0" class="space-y-1.5 pt-1">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Deliverables Checklist
            </span>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div
                v-for="(del, dIdx) in m.deliverables"
                :key="dIdx"
                class="flex items-center gap-2 rounded-lg border border-border/60 bg-canvas-elevated px-3 py-1.5 text-xs text-ink"
              >
                <CheckSquare class="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{{ del }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scope Terms & Conditions (Rendered Markdown Body) -->
    <div v-if="renderedBodyHtml" class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
      <div class="flex items-center gap-2 font-display text-sm font-bold text-ink border-b border-border/60 pb-3">
        <ShieldCheck class="h-4 w-4 text-accent" />
        <span>Scope Terms &amp; Detailed Specification</span>
      </div>

      <div class="prose prose-sm dark:prose-invert max-w-none text-xs text-ink-soft leading-relaxed space-y-3" v-html="renderedBodyHtml" />
    </div>

    <!-- In-Page Formal Signature & Acceptance Section -->
    <PortalProposalAcceptanceSection
      :proposal="proposal"
      :is-accepted="isAccepted"
      @sign-proposal="emit('signProposal')"
    />
  </div>
</template>
