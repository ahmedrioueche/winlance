<script setup lang="ts">
import { Eye, RotateCcw } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { BaseButton } from '@/shared/components/base'
import type { ProposalVersion } from '../../types'

interface Props {
  version: ProposalVersion
}

defineProps<Props>()

const emit = defineEmits<{
  restore: []
  backToLatest: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
    <div class="flex items-center gap-2">
      <Eye class="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span class="text-sm font-semibold text-amber-700 dark:text-amber-300">
        {{ t('proposals.editor.versions.viewingBanner', { num: version.version_number, summary: version.change_summary }) }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <BaseButton variant="secondary" size="sm" @click="emit('restore')">
        <RotateCcw class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.versions.restore', 'Restore this version') }}</span>
      </BaseButton>
      <BaseButton size="sm" @click="emit('backToLatest')">
        {{ t('proposals.editor.versions.backToLatest', 'Back to latest') }}
      </BaseButton>
    </div>
  </div>
</template>
