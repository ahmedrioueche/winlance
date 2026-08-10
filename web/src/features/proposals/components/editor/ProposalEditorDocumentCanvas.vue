<script setup lang="ts">
import MarkdownToolbar from '@/shared/components/markdown/MarkdownToolbar.vue'

interface Props {
  title: string
  amount: number | string
  currency: string
  body: string
  isViewingPast: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:title': [val: string]
  'update:amount': [val: number | string]
  'update:currency': [val: string]
  'update:body': [val: string]
}>()
</script>

<template>
  <div
    class="relative rounded-2xl border bg-canvas-elevated p-6 sm:p-10 shadow-lift min-h-[750px] space-y-4"
    :class="isViewingPast ? 'border-amber-500/30 border-dashed' : 'border-border'"
  >
    <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-10 rounded-2xl" aria-hidden="true" />

    <!-- Document Header: Title + Amount Badge -->
    <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
      <div class="flex-1">
        <input
          :value="title"
          type="text"
          class="w-full bg-transparent font-display text-lg sm:text-xl font-bold tracking-tight text-ink placeholder:text-muted focus:outline-none border-none p-0"
          :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
          :readonly="isViewingPast"
          placeholder="Proposal Title..."
          @input="emit('update:title', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Amount Badge -->
      <div class="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs shrink-0 shadow-sm">
        <span class="text-muted font-medium">Estimated:</span>
        <span class="font-bold text-ink">$</span>
        <input
          :value="amount"
          type="number"
          step="100"
          class="w-24 bg-transparent font-bold text-ink focus:outline-none p-0 border-none text-sm"
          :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
          :readonly="isViewingPast"
          placeholder="0.00"
          @input="emit('update:amount', ($event.target as HTMLInputElement).value)"
        />
        <span class="font-semibold text-accent uppercase">{{ currency }}</span>
      </div>
    </div>

    <!-- Body Editor -->
    <div class="relative z-10 space-y-2 pt-1">
      <MarkdownToolbar textarea-id="freelancer-proposal-body-textarea" />
      <textarea
        id="freelancer-proposal-body-textarea"
        :value="body"
        class="w-full min-h-[620px] resize-y rounded-xl border bg-canvas p-6 font-mono text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 border-border/80"
        :class="{ 'border-amber-500/30 border-dashed opacity-80 cursor-default': isViewingPast }"
        :readonly="isViewingPast"
        placeholder="Write or paste your proposal content here..."
        @input="emit('update:body', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>
