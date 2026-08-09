<script setup lang="ts">
import { Edit3, Share2 } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Proposal } from '../../types'

interface Props {
  proposal?: Proposal
}

defineProps<Props>()

defineEmits<{
  share: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ proposal?.title || 'Proposal Details' }}
        </h1>
        <span
          class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          :class="proposal?.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-purple-500/15 text-purple-600 border-purple-500/30'"
        >
          {{ proposal?.status }}
        </span>
      </div>
      <p class="mt-1 text-xs text-muted">
        Client proposal specifications, deliverable investment, and client approval details
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2.5">
      <BaseButton variant="secondary" size="sm" @click="$emit('share')">
        <Share2 class="h-3.5 w-3.5 text-accent" />
        <span>Share Portal Link</span>
      </BaseButton>

      <BaseButton size="sm" @click="$router.push(`/app/proposals/${proposal?.id}/edit`)">
        <Edit3 class="h-3.5 w-3.5" />
        <span>Edit Proposal</span>
      </BaseButton>
    </div>
  </div>
</template>
