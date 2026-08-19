<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import { AlertCircle, CheckSquare, Clock, DollarSign, FileText, ShieldCheck, Sparkles, UserCheck } from 'lucide-vue-next'

import type { Proposal, ProposalAddon } from '@/features/proposals/types'
import PortalProposalAcceptanceSection from './PortalProposalAcceptanceSection.vue'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
  selectedAddonIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedAddonIds: () => [],
})

const emit = defineEmits<{
  signProposal: []
  requestChanges: [notes: string]
  'update:selectedAddonIds': [ids: string[]]
}>()

const localSelectedAddons = ref<string[]>([])

watch(
  () => props.proposal?.addons,
  (addons) => {
    if (addons && Array.isArray(addons)) {
      localSelectedAddons.value = addons.filter((a) => a.is_selected).map((a) => a.id)
    }
  },
  { immediate: true },
)

function toggleAddon(id: string) {
  if (props.isAccepted || props.proposal?.is_expired) return
  const current = [...localSelectedAddons.value]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  localSelectedAddons.value = current
  emit('update:selectedAddonIds', current)
}

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

const addonsList = computed<ProposalAddon[]>(() => {
  return props.proposal?.addons || []
})

const selectedAddonsSum = computed(() => {
  return addonsList.value
    .filter((a) => localSelectedAddons.value.includes(a.id))
    .reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
})

const computedTotalBudget = computed(() => {
  const base = Number(props.proposal?.amount) || 0
  return base + selectedAddonsSum.value
})

const formattedExpirationDate = computed(() => {
  if (!props.proposal?.expires_at) return ''
  return new Date(props.proposal.expires_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

const formattedSignedDate = computed(() => {
  if (!props.proposal?.signed_at) return ''
  return new Date(props.proposal.signed_at).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- ⚠️ EXPIRATION BANNER -->
    <div
      v-if="proposal?.is_expired"
      class="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs shadow-soft"
    >
      <AlertCircle class="h-5 w-5 shrink-0" />
      <div>
        <span class="font-bold">This proposal expired on {{ formattedExpirationDate }}.</span>
        <p class="text-[11px] opacity-90">Acceptance is disabled. Please reach out to the freelancer to extend or re-issue this estimate.</p>
      </div>
    </div>

    <div
      v-else-if="proposal?.expires_at && !isAccepted"
      class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-600 dark:text-amber-400 flex items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-2">
        <Clock class="h-4 w-4 shrink-0" />
        <span>Proposal Valid Until: <strong>{{ formattedExpirationDate }}</strong></span>
      </div>
      <span class="text-[11px] font-semibold underline">Limited-Time Offer</span>
    </div>

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

        <div v-if="computedTotalBudget" class="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <DollarSign class="h-4 w-4" />
          <span>${{ computedTotalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal?.currency || 'USD' }}</span>
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

    <!-- 🎁 INTERACTIVE OPTIONAL ADD-ONS SECTION -->
    <div v-if="addonsList.length > 0" class="rounded-2xl border border-purple-500/30 bg-canvas-elevated p-6 shadow-soft space-y-4">
      <div class="flex items-center justify-between border-b border-border/60 pb-3">
        <div class="flex items-center gap-2 font-display text-sm font-bold text-ink">
          <Sparkles class="h-4 w-4 text-purple-500" />
          <span>Optional Add-ons &amp; Service Upsells</span>
        </div>
        <span class="text-xs text-purple-500 font-medium">Select optional extras to customize package</span>
      </div>

      <div class="space-y-3">
        <div
          v-for="addon in addonsList"
          :key="addon.id"
          class="rounded-xl border p-4 transition-all cursor-pointer flex items-start justify-between gap-4"
          :class="localSelectedAddons.includes(addon.id) ? 'border-purple-500 bg-purple-500/5 shadow-xs' : 'border-border bg-canvas hover:border-purple-500/40'"
          @click="toggleAddon(addon.id)"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="localSelectedAddons.includes(addon.id)"
              :disabled="isAccepted || proposal?.is_expired"
              class="mt-1 h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
              @change.stop="toggleAddon(addon.id)"
            />
            <div class="space-y-0.5">
              <h4 class="font-bold text-xs text-ink">{{ addon.title }}</h4>
              <p v-if="addon.description" class="text-muted text-[11px] leading-relaxed">{{ addon.description }}</p>
            </div>
          </div>
          <span class="font-bold text-xs text-purple-600 dark:text-purple-400 shrink-0">
            +${{ Number(addon.amount).toLocaleString() }}
          </span>
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

    <!-- 📜 FORMAL SIGNING AUDIT CERTIFICATE (When Accepted) -->
    <div v-if="isAccepted && proposal?.signed_at" class="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 shadow-soft space-y-4">
      <div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div class="flex items-center gap-2 font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <UserCheck class="h-5 w-5" />
          <span>Formal Electronic Signature Audit Certificate</span>
        </div>
        <span class="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Verified Legal Sign-Off</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-muted text-[11px] block">Signer Name:</span>
          <strong class="text-ink font-semibold">{{ proposal.signed_name || 'Authorized Client Representative' }}</strong>
        </div>
        <div>
          <span class="text-muted text-[11px] block">Signer Email:</span>
          <strong class="text-ink font-semibold">{{ proposal.signed_email || 'Verified Client Contact' }}</strong>
        </div>
        <div>
          <span class="text-muted text-[11px] block">Timestamp:</span>
          <strong class="text-ink font-semibold">{{ formattedSignedDate }}</strong>
        </div>
        <div>
          <span class="text-muted text-[11px] block">Verified IP Address:</span>
          <strong class="text-ink font-mono font-semibold">{{ proposal.signed_ip || '127.0.0.1 (Verified)' }}</strong>
        </div>
      </div>
      <div class="pt-2 border-t border-emerald-500/20 text-[10px] text-muted font-mono truncate">
        Document ID Hash: {{ proposal.id }} | Status: SIGNED &amp; ACCEPTED
      </div>
    </div>

    <!-- In-Page Formal Signature & Acceptance Section -->
    <PortalProposalAcceptanceSection
      :proposal="proposal"
      :is-accepted="isAccepted"
      @sign-proposal="emit('signProposal')"
      @request-changes="emit('requestChanges', $event)"
    />
  </div>
</template>
