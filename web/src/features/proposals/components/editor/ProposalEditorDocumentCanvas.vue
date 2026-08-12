<script setup lang="ts">
import MarkdownToolbar from '@/shared/components/markdown/MarkdownToolbar.vue'
import { useToast } from '@/shared/toast/useToast'
import { FileText, Loader2, ShieldCheck, Wand2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenerateProposalSectionMutation } from '../../queries'
import type { ProposalMilestoneItem } from './ProposalEditorMilestonesSection.vue'

interface Props {
  title: string
  summary: string
  body: string
  isViewingPast: boolean
  milestones?: ProposalMilestoneItem[]
}

const props = withDefaults(defineProps<Props>(), {
  milestones: () => [],
})

const emit = defineEmits<{
  'update:summary': [val: string]
  'update:body': [val: string]
}>()

const { t } = useI18n()
const toast = useToast()
const generateSectionMutation = useGenerateProposalSectionMutation()

const isGeneratingSummary = ref(false)
const isGeneratingTerms = ref(false)

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

    <!-- 📌 SECTION 1: EXECUTIVE SUMMARY & PROJECT INTRO -->
    <div class="relative z-10 space-y-3">
      <div class="border-border/60 flex items-center justify-between gap-2 border-b pb-2">
        <div class="flex items-center gap-2">
          <FileText class="text-accent h-4 w-4" />
          <h3 class="font-display text-ink text-sm font-bold">
            {{ t('proposals.editor.section1Title', 'Section 1: Executive Summary & Background') }}
          </h3>
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
      <textarea
        :value="summary"
        class="border-border/80 bg-canvas text-ink placeholder:text-muted/60 focus:border-accent focus:ring-accent/20 min-h-[140px] w-full resize-y rounded-xl border p-3.5 text-xs leading-relaxed focus:ring-1 focus:outline-none"
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

    <!-- 📑 SECTION 3: TERMS, PAYMENT SCHEDULE & NEXT STEPS -->
    <div class="border-border/60 relative z-10 space-y-3 border-t pt-3">
      <div class="border-border/60 flex items-center justify-between gap-2 border-b pb-2">
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
        class="border-border/80 bg-canvas text-ink placeholder:text-muted/60 focus:border-accent focus:ring-accent/20 min-h-[120px] w-full resize-y rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:ring-1 focus:outline-none"
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
