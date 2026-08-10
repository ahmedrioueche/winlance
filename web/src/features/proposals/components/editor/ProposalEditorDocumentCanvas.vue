<script setup lang="ts">
import { FileText, ShieldCheck } from 'lucide-vue-next'
import MarkdownToolbar from '@/shared/components/markdown/MarkdownToolbar.vue'

interface Props {
  title: string
  summary: string
  amount: number | string
  currency: string
  body: string
  isViewingPast: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:title': [val: string]
  'update:summary': [val: string]
  'update:amount': [val: number | string]
  'update:currency': [val: string]
  'update:body': [val: string]
}>()
</script>

<template>
  <div
    class="relative rounded-2xl border bg-canvas-elevated p-6 sm:p-8 shadow-lift space-y-6"
    :class="isViewingPast ? 'border-amber-500/30 border-dashed' : 'border-border'"
  >
    <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-10 rounded-2xl" aria-hidden="true" />

    <!-- Document Header: Title + Amount Badge -->
    <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
      <div class="flex-1">
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Proposal Title</label>
        <input
          :value="title"
          type="text"
          class="w-full bg-transparent font-display text-lg sm:text-xl font-bold tracking-tight text-ink placeholder:text-muted focus:outline-none border-none p-0"
          :class="{ 'opacity-60 pointer-events-none': isViewingPast }"
          :readonly="isViewingPast"
          placeholder="e.g. E-Commerce Platform Redesign & Development"
          @input="emit('update:title', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Amount Badge -->
      <div class="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs shrink-0 shadow-sm">
        <span class="text-muted font-medium">Total Budget:</span>
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

    <!-- 📌 SECTION 1: EXECUTIVE SUMMARY & PROJECT INTRO -->
    <div class="relative z-10 space-y-3 pt-2">
      <div class="flex items-center gap-2 border-b border-border/60 pb-2">
        <FileText class="h-4 w-4 text-accent" />
        <h3 class="font-display text-sm font-bold text-ink">
          Section 1: Executive Summary &amp; Background
        </h3>
      </div>
      <textarea
        :value="summary"
        class="w-full min-h-[140px] resize-y rounded-xl border border-border/80 bg-canvas p-4 text-xs leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        :class="{ 'opacity-80 cursor-default': isViewingPast }"
        :readonly="isViewingPast"
        placeholder="Brief overview of the project background, goals, and executive summary..."
        @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- 📑 SECTION 3: TERMS, PAYMENT SCHEDULE & NEXT STEPS -->
    <div class="relative z-10 space-y-3 pt-4 border-t border-border/60">
      <div class="flex items-center gap-2 border-b border-border/60 pb-2">
        <ShieldCheck class="h-4 w-4 text-accent" />
        <h3 class="font-display text-sm font-bold text-ink">
          Section 3: Scope Terms &amp; Next Steps
        </h3>
      </div>
      <MarkdownToolbar textarea-id="proposal-terms-textarea" />
      <textarea
        id="proposal-terms-textarea"
        :value="body"
        class="w-full min-h-[220px] resize-y rounded-xl border border-border/80 bg-canvas p-4 font-mono text-xs leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        :class="{ 'border-amber-500/30 border-dashed opacity-80 cursor-default': isViewingPast }"
        :readonly="isViewingPast"
        placeholder="Specific terms, out-of-scope items, payment conditions, or next steps..."
        @input="emit('update:body', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>
