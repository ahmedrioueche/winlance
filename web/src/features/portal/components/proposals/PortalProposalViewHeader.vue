<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckCircle2, Download, FileCheck } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  signProposal: []
  downloadPdf: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ proposal?.title || t('portal.title') }}
        </h1>
        <span
          class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          :class="isAccepted ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-purple-500/15 text-purple-600 border-purple-500/30'"
        >
          {{ proposal?.status }}
        </span>
      </div>
      <p class="mt-1 text-xs text-muted">
        {{ t('portal.subtitle') }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <BaseButton variant="secondary" size="sm" @click="emit('downloadPdf')">
        <Download class="h-3.5 w-3.5" />
        <span>{{ t('portal.downloadPdf') }}</span>
      </BaseButton>

      <BaseButton v-if="!isAccepted" size="sm" @click="emit('signProposal')">
        <FileCheck class="h-4 w-4" />
        <span>{{ t('portal.signProposal') }}</span>
      </BaseButton>

      <div v-else class="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 class="h-4 w-4" />
        <span>Signed & Accepted</span>
      </div>
    </div>
  </div>
</template>
