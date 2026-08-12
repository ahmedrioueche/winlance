<script setup lang="ts">
import { Loader2, Sparkles, Wand2 } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseModal } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import { useSmartImportProposalMutation } from '../../queries'
import type { SmartImportResult } from '../../types'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: [result: SmartImportResult]
}>()

const { t } = useI18n()
const toast = useToast()
const rawText = ref('')
const smartImportMutation = useSmartImportProposalMutation()

// Animated processing status messages
const processingSteps = [
  'Analyzing your text…',
  'Extracting project structure…',
  'Identifying milestones & deliverables…',
  'Structuring proposal sections…',
  'Generating executive summary…',
  'Finalizing proposal breakdown…',
]
const currentStepIndex = ref(0)
let stepInterval: ReturnType<typeof setInterval> | null = null

const currentProcessingStep = computed(() => processingSteps[currentStepIndex.value] || processingSteps[0])

const MAX_CHARS = 15_000
const charCount = computed(() => rawText.value.length)
const isLargeInput = computed(() => charCount.value > 3000)
const isOverLimit = computed(() => charCount.value > MAX_CHARS)

function startProcessingAnimation() {
  currentStepIndex.value = 0
  stepInterval = setInterval(() => {
    if (currentStepIndex.value < processingSteps.length - 1) {
      currentStepIndex.value++
    }
  }, 4000)
}

function stopProcessingAnimation() {
  if (stepInterval) {
    clearInterval(stepInterval)
    stepInterval = null
  }
  currentStepIndex.value = 0
}

// Clear interval on unmount
onUnmounted(stopProcessingAnimation)

// Reset animation when modal closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) stopProcessingAnimation()
})

async function handleImport() {
  if (!rawText.value.trim()) {
    toast.info(t('proposals.editor.smartImport.emptyWarning', 'Please paste your client call notes, requirements, or proposal text first.'))
    return
  }
  if (isOverLimit.value) {
    toast.errorKey('proposals.editor.smartImport.charLimitError')
    return
  }

  startProcessingAnimation()

  try {
    const result = await smartImportMutation.mutateAsync(rawText.value.trim())

    // Validate the result has meaningful content
    const milestonesCount = result.milestones?.length ?? 0
    if (milestonesCount > 0) {
      toast.success(
        t('proposals.editor.smartImport.successDetailed', { count: milestonesCount }),
      )
    } else {
      toast.success(t('proposals.editor.smartImport.success', 'Proposal and milestones structured successfully!'))
    }

    emit('imported', result)
    emit('close')
    rawText.value = ''
  } catch (err: any) {
    // Provide more specific error messages
    const status = err?.response?.status
    if (status === 408 || err?.code === 'ECONNABORTED') {
      toast.errorKey('proposals.editor.smartImport.timeoutError')
    } else if (status === 500) {
      toast.errorKey('proposals.editor.smartImport.serverError')
    } else {
      toast.errorFromUnknown(err)
    }
  } finally {
    stopProcessingAnimation()
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('proposals.editor.smartImport.modalTitle', '✨ Smart AI Proposal Import')"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3.5 text-xs text-ink">
        <Sparkles class="h-5 w-5 shrink-0 text-accent mt-0.5" />
        <div class="space-y-1">
          <p class="font-bold text-ink">{{ t('proposals.editor.smartImport.bannerTitle', 'Paste anything below') }}</p>
          <p class="text-muted leading-relaxed">
            {{ t('proposals.editor.smartImport.bannerText', 'Paste raw client call notes, WhatsApp messages, RFP bullet points, or an existing proposal draft. Winlance AI will automatically extract the title, executive summary, terms, and structured milestone phases with deliverable checklists!') }}
          </p>
        </div>
      </div>

      <!-- Processing Overlay -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="smartImportMutation.isPending.value"
          class="flex flex-col items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center"
        >
          <div class="relative">
            <Loader2 class="h-8 w-8 animate-spin text-accent" />
            <Sparkles class="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent animate-pulse" />
          </div>
          <p class="text-sm font-semibold text-ink transition-all duration-300">
            {{ currentProcessingStep }}
          </p>
          <p v-if="isLargeInput" class="text-xs text-muted">
            {{ t('proposals.editor.smartImport.largeInputNote', 'Large document detected — this may take up to 30 seconds') }}
          </p>
        </div>
      </Transition>

      <div v-show="!smartImportMutation.isPending.value">
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-semibold text-ink">{{ t('proposals.editor.smartImport.inputLabel', 'Raw Notes / Requirements / Proposal Text') }}</label>
          <span
            class="text-[10px] tabular-nums"
            :class="isOverLimit ? 'text-red-500 font-semibold' : isLargeInput ? 'text-amber-500' : 'text-muted'"
          >
            {{ charCount.toLocaleString() }} / {{ MAX_CHARS.toLocaleString() }} {{ t('proposals.editor.smartImport.chars', 'chars') }}
          </span>
        </div>
        <textarea
          v-model="rawText"
          class="w-full min-h-[220px] resize-y rounded-xl border border-border bg-canvas p-4 font-mono text-xs leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          :placeholder="t('proposals.editor.smartImport.inputPlaceholder', 'e.g. Client wants a Next.js e-commerce app with Stripe payments, admin panel, and mobile responsiveness. Target budget around $6,000...')"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" :disabled="smartImportMutation.isPending.value" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="smartImportMutation.isPending.value"
        :disabled="!rawText.trim() || isOverLimit || smartImportMutation.isPending.value"
        @click="handleImport"
      >
        <Loader2 v-if="smartImportMutation.isPending.value" class="h-4 w-4 animate-spin" />
        <Wand2 v-else class="h-4 w-4" />
        <span>{{ smartImportMutation.isPending.value ? t('proposals.editor.smartImport.processing', 'Processing…') : t('proposals.editor.smartImport.submitBtn', 'Auto-Structure Proposal') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
