<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import { CheckCircle2, ShieldCheck, FileText, Lock } from 'lucide-vue-next'
import type { Contract } from '../types'

const props = defineProps<{
  contract: Contract
}>()

function formatCurrency(value: string | number | null | undefined, currency = 'USD'): string {
  const num = Number(value) || 0
  return num.toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  })
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const renderedBodyHtml = computed(() => {
  if (!props.contract.body?.trim()) return ''
  return marked.parse(props.contract.body, { async: false }) as string
})

const isSigned = computed(() => props.contract.status === 'SIGNED' || !!props.contract.signed_at)
</script>

<template>
  <div class="rounded-xl border border-border bg-canvas-elevated p-6 sm:p-8 shadow-sm space-y-6">
    <!-- Document Header -->
    <div class="border-b border-border pb-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
          <FileText class="h-4 w-4" />
          <span>Service Agreement Contract</span>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="isSigned"
            class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"
          >
            <ShieldCheck class="h-3.5 w-3.5" />
            Signed & Executed
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase"
          >
            {{ contract.status }}
          </span>
        </div>
      </div>

      <h1 class="font-display text-2xl sm:text-3xl text-ink font-bold">
        {{ contract.title || 'Untitled Contract' }}
      </h1>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg bg-surface/50 p-4 border border-border/50 text-xs">
        <div>
          <span class="text-muted block text-[10px] uppercase font-semibold">Total Amount</span>
          <span class="font-bold text-accent text-sm sm:text-base">
            {{ formatCurrency(contract.amount, contract.currency) }}
          </span>
        </div>
        <div>
          <span class="text-muted block text-[10px] uppercase font-semibold">Date Created</span>
          <span class="font-medium text-ink">
            {{ formatDate(contract.created_at) }}
          </span>
        </div>
        <div v-if="contract.signed_at" class="col-span-2 sm:col-span-1">
          <span class="text-muted block text-[10px] uppercase font-semibold">Signed Date</span>
          <span class="font-medium text-emerald-600 dark:text-emerald-400">
            {{ formatDate(contract.signed_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Contract Body Content -->
    <div
      v-if="renderedBodyHtml"
      class="prose dark:prose-invert max-w-none text-sm text-ink-soft leading-relaxed space-y-4"
      v-html="renderedBodyHtml"
    ></div>
    <div v-else class="py-8 text-center text-sm text-muted italic">
      No contract body content rendered yet. Click "Generate" to generate content from template.
    </div>

    <!-- Electronic Signature Audit Certificate -->
    <div
      v-if="isSigned"
      class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Lock class="h-4 w-4" />
          <span>Electronic Signature Audit Certificate</span>
        </div>
        <CheckCircle2 class="h-5 w-5 text-emerald-500" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-emerald-500/20 pt-3">
        <div>
          <span class="text-muted block text-[10px]">Signer Name</span>
          <span class="font-semibold text-ink">{{ contract.signed_name || 'Authorized Signer' }}</span>
        </div>
        <div>
          <span class="text-muted block text-[10px]">Signer Email</span>
          <span class="font-semibold text-ink">{{ contract.signed_email || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-muted block text-[10px]">Execution Timestamp</span>
          <span class="font-semibold text-ink">{{ formatDate(contract.signed_at) }}</span>
        </div>
        <div>
          <span class="text-muted block text-[10px]">IP Address</span>
          <span class="font-semibold text-ink">{{ contract.signed_ip || '127.0.0.1' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
