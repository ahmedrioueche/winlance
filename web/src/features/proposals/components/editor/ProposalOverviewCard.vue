<script setup lang="ts">
import { DollarSign, FileEdit } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

interface Props {
  title: string
  amount: number | string
  currency: string
  isViewingPast: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:title': [val: string]
  'update:amount': [val: number | string]
  'update:currency': [val: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="relative rounded-2xl border bg-canvas-elevated p-5 sm:p-6 shadow-soft space-y-4"
    :class="isViewingPast ? 'border-amber-500/30 border-dashed' : 'border-border'"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Title Field -->
      <div class="flex-1 space-y-1">
        <label class="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <FileEdit class="h-3.5 w-3.5 text-accent" />
          <span>{{ t('proposals.editor.titleLabel', 'Proposal Title') }}</span>
        </label>
        <input
          :value="title"
          type="text"
          class="w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-display text-base font-bold text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
          :readonly="isViewingPast"
          :placeholder="t('proposals.editor.titlePlaceholder', 'e.g. E-Commerce Platform Redesign & Development')"
          @input="emit('update:title', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Total Budget Field -->
      <div class="sm:w-52 space-y-1 shrink-0">
        <label class="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <DollarSign class="h-3.5 w-3.5 text-emerald-500" />
          <span>{{ t('proposals.editor.totalsTitle', 'Total Budget') }}</span>
        </label>
        <div class="flex items-center rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-bold text-ink focus-within:border-accent">
          <span class="text-muted font-bold me-1">$</span>
          <input
            :value="amount"
            type="number"
            step="100"
            class="w-full bg-transparent font-bold text-ink focus:outline-none p-0 border-none text-sm"
            :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
            :readonly="isViewingPast"
            placeholder="0.00"
            @input="emit('update:amount', ($event.target as HTMLInputElement).value)"
          />
          <span class="text-accent uppercase text-xs font-semibold ms-1 shrink-0">{{ currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
