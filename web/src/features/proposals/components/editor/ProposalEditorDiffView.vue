<script setup lang="ts">
import { GitCompare, Globe, History, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { DiffLineItem } from '@/shared/utils/diff'
import type { ProposalVersion } from '../../types'

interface Props {
  comparingVersion: ProposalVersion
  compareTargetId: string
  compareTargetOptions: SelectOption[]
  compareRightLabel: string
  compareRightTitle: string
  compareRightAmount: number
  compareRightCurrency: string
  leftAmount: number
  leftCurrency: string
  leftTitle: string
  amountDiff: number
  hasAmountDiff: boolean
  hasTitleDiff: boolean
  diffLines: {
    left: DiffLineItem[]
    right: DiffLineItem[]
  }
}

defineProps<Props>()

const emit = defineEmits<{
  'update:compareTargetId': [val: string]
  close: []
}>()

const { t, d } = useI18n()

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr.split('T')[0] ?? ''
  }
}

function formatAuthor(ver: ProposalVersion): string {
  const name = ver.created_by_name || ver.created_by_role
  if (ver.created_by_role === 'client' && ver.created_by_name) {
    return `${ver.created_by_name} (${t('proposals.editor.versions.client', 'Client')})`
  }
  return name
}
</script>

<template>
  <div class="space-y-4">
    <!-- Diff Header Bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft">
      <div class="flex items-center gap-3">
        <GitCompare class="h-5 w-5 text-accent" />
        <div>
          <h2 class="font-display text-base font-bold text-ink">
            {{ t('proposals.editor.versions.comparingTitle', { num: comparingVersion.version_number }) }}
            <span class="text-muted font-normal">({{ comparingVersion.change_summary }})</span>
            {{ t('proposals.editor.versions.vs', 'vs') }} {{ compareRightLabel }}
          </h2>
          <p class="text-xs text-muted">
            Base: {{ formatAuthor(comparingVersion) }} · {{ formatDate(comparingVersion.created_at) }}
          </p>
        </div>
      </div>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        <X class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.versions.closeComparison', 'Close Comparison') }}</span>
      </BaseButton>
    </div>

    <!-- Financial & Title Diff Summary Bar -->
    <div
      v-if="hasAmountDiff || hasTitleDiff"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-canvas-elevated p-3.5 shadow-sm text-xs"
    >
      <!-- Price Diff Pill -->
      <div v-if="hasAmountDiff" class="flex items-center gap-2">
        <span class="font-semibold text-muted">{{ t('proposals.editor.versions.estimatedDiff', 'Estimated Amount Diff:') }}</span>
        <div class="flex items-center gap-1.5 font-bold">
          <span class="text-ink">${{ leftAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ leftCurrency }}</span>
          <span class="text-muted">➔</span>
          <span class="text-ink">${{ compareRightAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ compareRightCurrency }}</span>
          <span
            class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            :class="amountDiff > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'"
          >
            {{ amountDiff > 0 ? '+' : '' }}${{ amountDiff.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>

      <!-- Title Diff Pill -->
      <div v-if="hasTitleDiff" class="flex items-center gap-2">
        <span class="font-semibold text-muted">{{ t('proposals.editor.versions.titleChanged', 'Title Changed:') }}</span>
        <span class="line-through text-muted">{{ leftTitle }}</span>
        <span class="text-muted">➔</span>
        <span class="font-bold text-ink">{{ compareRightTitle }}</span>
      </div>
    </div>

    <!-- Side-by-Side Diff Panels -->
    <div class="grid grid-cols-1 gap-0 lg:grid-cols-2 rounded-2xl border border-border overflow-hidden shadow-lift">
      <!-- Left: Base Version Content -->
      <div class="border-b lg:border-b-0 lg:border-r border-border">
        <div class="flex h-14 items-center gap-2 border-b border-border bg-canvas-muted px-5">
          <History class="h-4 w-4 text-muted shrink-0" />
          <span class="text-sm font-bold text-ink">v{{ comparingVersion.version_number }}</span>
          <span class="text-xs text-muted truncate">— {{ comparingVersion.change_summary }}</span>
        </div>
        <div class="max-h-[70vh] overflow-auto bg-canvas p-5 font-mono text-sm leading-relaxed">
          <div
            v-for="(line, idx) in diffLines.left"
            :key="`l-${idx}`"
            class="min-h-[1.5rem] px-2 py-0.5"
            :class="{
              'bg-red-500/10 text-red-700 dark:text-red-300 rounded': line.type === 'remove',
              'text-ink-soft': line.type === 'same',
              'opacity-0': line.type === 'empty',
            }"
          >
            <span v-if="line.type === 'remove'" class="font-bold text-red-500 me-2 select-none">−</span>
            <span>{{ line.text || ' ' }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Comparison Target -->
      <div>
        <div class="flex h-14 items-center justify-between gap-3 border-b border-border bg-canvas-muted px-5">
          <div class="flex items-center gap-2 min-w-0">
            <Globe class="h-4 w-4 text-accent shrink-0" />
            <span class="text-xs font-semibold text-muted shrink-0">{{ t('proposals.editor.versions.compareAgainst', 'Compare against:') }}</span>
          </div>
          <div class="w-64 shrink-0">
            <BaseSelect
              :model-value="compareTargetId"
              label=""
              :options="compareTargetOptions"
              @update:model-value="emit('update:compareTargetId', $event)"
            />
          </div>
        </div>
        <div class="max-h-[70vh] overflow-auto bg-canvas p-5 font-mono text-sm leading-relaxed">
          <div
            v-for="(line, idx) in diffLines.right"
            :key="`r-${idx}`"
            class="min-h-[1.5rem] px-2 py-0.5"
            :class="{
              'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded': line.type === 'add',
              'text-ink-soft': line.type === 'same',
              'opacity-0': line.type === 'empty',
            }"
          >
            <span v-if="line.type === 'add'" class="font-bold text-emerald-500 me-2 select-none">+</span>
            <span>{{ line.text || ' ' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
