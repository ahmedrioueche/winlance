<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FileText } from 'lucide-vue-next'
import { BaseInput, BaseTextarea } from '@/shared/components/base'

const title = defineModel<string>('title', { default: '' })
const targetProjectName = defineModel<string>('targetProjectName', { default: '' })
const summary = defineModel<string>('summary', { default: '' })

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
    <h2 class="font-display text-base font-bold text-ink flex items-center gap-2 border-b border-border/60 pb-3">
      <FileText class="h-4 w-4 text-accent" />
      {{ t('proposals.editor.scopeSectionTitle') }}
    </h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <BaseInput
        v-model="title"
        :label="t('proposals.editor.titleLabel')"
        :placeholder="t('proposals.editor.titlePlaceholder')"
        required
      />

      <BaseInput
        v-model="targetProjectName"
        :label="t('proposals.editor.targetProjectNameLabel')"
        :placeholder="t('proposals.editor.targetProjectNamePlaceholder')"
      />
    </div>

    <BaseTextarea
      v-model="summary"
      :label="t('proposals.editor.summaryLabel')"
      :placeholder="t('proposals.editor.summaryPlaceholder')"
      :rows="4"
    />
  </div>
</template>
