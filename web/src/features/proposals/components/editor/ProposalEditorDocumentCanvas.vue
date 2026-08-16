<script setup lang="ts">
import MarkdownToolbar from '@/shared/components/markdown/MarkdownToolbar.vue'
import { useToast } from '@/shared/toast/useToast'
import { Clock, FileText, Loader2, Plus, ShieldCheck, Sparkles, Trash2, Wand2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenerateProposalSectionMutation } from '../../queries'
import type { ProposalAddon } from '../../types'
import type { ProposalMilestoneItem } from './ProposalEditorMilestonesSection.vue'

interface Props {
  title: string
  summary: string
  body: string
  expiresAt?: string
  addons?: ProposalAddon[]
  isViewingPast: boolean
  milestones?: ProposalMilestoneItem[]
}

const props = withDefaults(defineProps<Props>(), {
  expiresAt: '',
  addons: () => [],
  milestones: () => [],
})

const emit = defineEmits<{
  'update:summary': [val: string]
  'update:body': [val: string]
  'update:expiresAt': [val: string]
  'update:addons': [val: ProposalAddon[]]
}>()

const { t } = useI18n()
const toast = useToast()
const generateSectionMutation = useGenerateProposalSectionMutation()

const isGeneratingSummary = ref(false)
const isGeneratingTerms = ref(false)

const milestoneCount = computed(() => props.milestones?.length || 0)

// Dynamic min-height for Executive Summary textarea based on milestone count
const summaryMinHeight = computed(() => {
  if (milestoneCount.value <= 1) return '140px'
  const extra = (milestoneCount.value - 1) * 45
  return `${Math.min(140 + extra, 420)}px`
})

// Dynamic min-height for Scope Terms textarea based on milestone count
const termsMinHeight = computed(() => {
  if (milestoneCount.value <= 1) return '180px'
  const extra = (milestoneCount.value - 1) * 55
  return `${Math.min(180 + extra, 540)}px`
})

function addAddon() {
  const newAddon: ProposalAddon = {
    id: `addon-${Date.now()}`,
    title: '',
    description: '',
    amount: 500,
    is_selected: false,
  }
  emit('update:addons', [...props.addons, newAddon])
}

function removeAddon(index: number) {
  const next = [...props.addons]
  next.splice(index, 1)
  emit('update:addons', next)
}

function updateAddonField(index: number, field: keyof ProposalAddon, value: any) {
  const next = [...props.addons]
  next[index] = { ...next[index], [field]: value }
  emit('update:addons', next)
}

async function generateSummaryAI() {
  isGeneratingSummary.value = true
  try {
    const res = await generateSectionMutation.mutateAsync({
      section: 'summary',
      title: props.title,
      milestones: props.milestones,
    })
    emit('update:summary', res.text)
    toast.success(t('proposals.editor.summaryGenerated', 'Executive summary generated!'))
  } catch (err) {
    toast.errorFromUnknown(err)
  } finally {
    isGeneratingSummary.value = false
  }
}

async function generateTermsAI() {
  isGeneratingTerms.value = true
  try {
    const res = await generateSectionMutation.mutateAsync({
      section: 'terms',
      title: props.title,
      milestones: props.milestones,
    })
    emit('update:body', res.text)
    toast.success(t('proposals.editor.termsGenerated', 'Scope terms generated!'))
  } catch (err) {
    toast.errorFromUnknown(err)
  } finally {
    isGeneratingTerms.value = false
  }
}
</script>

<template>
  <div
    class="bg-canvas-elevated shadow-lift relative space-y-6 rounded-2xl border p-6 sm:p-8"
    :class="isViewingPast ? 'border-dashed border-amber-500/30' : 'border-border'"
  >
    <div
      class="blueprint-grid pointer-events-none absolute inset-0 rounded-2xl opacity-10"
      aria-hidden="true"
    />

    <!-- 📌 SECTION 1: EXECUTIVE SUMMARY & EXPIRATION DATE -->
    <div class="relative z-10 space-y-3">
      <div class="border-border/60 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <FileText class="text-accent h-4 w-4" />
          <h3 class="font-display text-ink text-sm font-bold">
            {{ t('proposals.editor.section1Title', 'Section 1: Executive Summary & Background') }}
          </h3>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Expiration Date Picker -->
          <div class="flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-2.5 py-1 text-xs">
            <Clock class="h-3.5 w-3.5 text-muted" />
            <span class="text-muted text-[11px] font-medium hidden sm:inline">Expires:</span>
            <input
              type="date"
              :value="expiresAt"
              class="bg-transparent text-ink font-semibold text-xs focus:outline-none"
              :readonly="isViewingPast"
              @input="emit('update:expiresAt', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <button
            v-if="!isViewingPast"
            type="button"
            class="border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60"
            :disabled="isGeneratingSummary"
            @click="generateSummaryAI"
          >
            <Loader2 v-if="isGeneratingSummary" class="h-3.5 w-3.5 animate-spin" />
            <Wand2 v-else class="h-3.5 w-3.5" />
            <span>{{ t('proposals.editor.generateSummary', 'AI Summary') }}</span>
          </button>
        </div>
      </div>
      <textarea
        :value="summary"
        class="border-border/80 bg-canvas text-ink placeholder:text-muted/60 focus:border-accent focus:ring-accent/20 transition-all duration-300 w-full resize-y rounded-xl border p-3.5 text-xs leading-relaxed focus:ring-1 focus:outline-none"
        :style="{ minHeight: summaryMinHeight }"
        :class="{ 'cursor-default opacity-80': isViewingPast }"
        :readonly="isViewingPast"
        :placeholder="
          t(
            'proposals.editor.summaryPlaceholder',
            'Brief overview of the project background, goals, and executive summary...',
          )
        "
        @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- 🎁 OPTIONAL ADD-ONS MANAGER -->
    <div class="border-border/60 relative z-10 space-y-3 border-t pt-3">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-2">
        <div class="flex items-center gap-2 min-w-0">
          <Sparkles class="h-4 w-4 text-purple-500 shrink-0" />
          <h3 class="font-display text-ink text-sm font-bold truncate">
            Optional Add-ons & Service Upsells
          </h3>
        </div>
        <button
          v-if="!isViewingPast"
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-500 hover:bg-purple-500/20 transition shrink-0"
          @click="addAddon"
        >
          <Plus class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Add Optional Add-on</span>
          <span class="sm:hidden">Add Add-on</span>
        </button>
      </div>

      <div v-if="addons.length === 0" class="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted">
        No optional add-ons added. Click "+ Add Optional Add-on" to offer client upselling services (e.g. SLA Support, SEO Setup).
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(item, idx) in addons"
          :key="item.id || idx"
          class="rounded-xl border border-border bg-canvas p-3 text-xs space-y-2 relative"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <input
              type="text"
              :value="item.title"
              placeholder="Add-on Title (e.g., 3 Months Post-Launch Support)"
              class="flex-1 rounded-lg border border-border bg-canvas-elevated px-3 py-1.5 text-xs text-ink font-semibold focus:border-accent focus:outline-none min-w-0"
              :readonly="isViewingPast"
              @input="updateAddonField(idx, 'title', ($event.target as HTMLInputElement).value)"
            />
            <div class="flex items-center gap-1">
              <div class="flex items-center gap-1 w-28 sm:w-32 shrink-0">
              <span class="text-muted font-bold">$</span>
              <input
                type="number"
                :value="item.amount"
                placeholder="500"
                class="w-full rounded-lg border border-border bg-canvas-elevated px-2 py-1.5 text-xs text-ink font-bold focus:border-accent focus:outline-none"
                :readonly="isViewingPast"
                @input="updateAddonField(idx, 'amount', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <button
              v-if="!isViewingPast"
              type="button"
              class="rounded-lg p-1.5 text-muted hover:bg-rose-500/10 hover:text-rose-500 transition shrink-0"
              @click="removeAddon(idx)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
            </div>
          </div>
          <input
            type="text"
            :value="item.description"
            placeholder="Brief description of deliverable or terms for this add-on..."
            class="w-full rounded-lg border border-border/70 bg-canvas-elevated/60 px-3 py-1 text-[11px] text-ink-soft focus:border-accent focus:outline-none"
            :readonly="isViewingPast"
            @input="updateAddonField(idx, 'description', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- 📑 SECTION 3: TERMS, PAYMENT SCHEDULE & NEXT STEPS -->
    <div class="border-border/60 relative z-10 space-y-3 border-t pt-3">
      <div class="border-border/60 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <ShieldCheck class="text-accent h-4 w-4" />
          <h3 class="font-display text-ink text-sm font-bold">
            {{ t('proposals.editor.section3Title', 'Section 3: Scope Terms & Next Steps') }}
          </h3>
        </div>

        <button
          v-if="!isViewingPast"
          type="button"
          class="border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60"
          :disabled="isGeneratingTerms"
          @click="generateTermsAI"
        >
          <Loader2 v-if="isGeneratingTerms" class="h-3.5 w-3.5 animate-spin" />
          <Wand2 v-else class="h-3.5 w-3.5" />
          <span>{{ t('proposals.editor.generateTerms', 'AI Terms') }}</span>
        </button>
      </div>
      <MarkdownToolbar textarea-id="proposal-terms-textarea" />
      <textarea
        id="proposal-terms-textarea"
        :value="body"
        class="border-border/80 bg-canvas text-ink placeholder:text-muted/60 focus:border-accent focus:ring-accent/20 transition-all duration-300 w-full resize-y rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:ring-1 focus:outline-none"
        :style="{ minHeight: termsMinHeight }"
        :class="{ 'cursor-default border-dashed border-amber-500/30 opacity-80': isViewingPast }"
        :readonly="isViewingPast"
        :placeholder="
          t(
            'proposals.editor.termsPlaceholder',
            'Specific terms, out-of-scope items, payment conditions, or next steps...',
          )
        "
        @input="emit('update:body', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>
