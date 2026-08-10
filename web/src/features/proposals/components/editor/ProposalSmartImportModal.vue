<script setup lang="ts">
import { Loader2, Sparkles, Wand2 } from 'lucide-vue-next'
import { ref } from 'vue'

import { BaseButton, BaseModal } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import { useSmartImportProposalMutation } from '../../queries'
import type { SmartImportResult } from '../../types'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: [result: SmartImportResult]
}>()

const toast = useToast()
const rawText = ref('')
const smartImportMutation = useSmartImportProposalMutation()

async function handleImport() {
  if (!rawText.value.trim()) {
    toast.info('Please paste your client call notes, requirements, or proposal text first.')
    return
  }

  try {
    const result = await smartImportMutation.mutateAsync(rawText.value.trim())
    toast.success('Proposal and milestones structured successfully!')
    emit('imported', result)
    emit('close')
    rawText.value = ''
  } catch (err) {
    toast.errorFromUnknown(err)
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    title="✨ Smart AI Proposal Import"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3.5 text-xs text-ink">
        <Sparkles class="h-5 w-5 shrink-0 text-accent mt-0.5" />
        <div class="space-y-1">
          <p class="font-bold text-ink">Paste anything below</p>
          <p class="text-muted leading-relaxed">
            Paste raw client call notes, WhatsApp messages, RFP bullet points, or an existing proposal draft. Winlance AI will automatically extract the title, executive summary, terms, and structured milestone phases with deliverable checklists!
          </p>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-ink">Raw Notes / Requirements / Proposal Text</label>
        <textarea
          v-model="rawText"
          class="w-full min-h-[220px] resize-y rounded-xl border border-border bg-canvas p-4 font-mono text-xs leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          placeholder="e.g. Client wants a Next.js e-commerce app with Stripe payments, admin panel, and mobile responsiveness. Target budget around $6,000..."
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        Cancel
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="smartImportMutation.isPending.value"
        :disabled="!rawText.trim()"
        @click="handleImport"
      >
        <Loader2 v-if="smartImportMutation.isPending.value" class="h-4 w-4 animate-spin" />
        <Wand2 v-else class="h-4 w-4" />
        <span>Auto-Structure Proposal</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
