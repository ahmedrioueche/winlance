<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import type { Requirement } from '../../types'

interface Props {
  requirements: Requirement[]
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
    <div class="flex items-center justify-between border-b border-border/60 pb-3">
      <span class="font-display text-sm font-bold text-ink flex items-center gap-2">
        <FileText class="h-4 w-4 text-accent" />
        Scope Requirements
      </span>
      <span class="text-xs text-muted">({{ requirements.length }})</span>
    </div>

    <div v-if="requirements.length === 0" class="text-xs text-muted text-center py-6">
      No scope requirements recorded yet.
    </div>

    <div v-else class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
      <div
        v-for="req in requirements"
        :key="req.id"
        class="rounded-xl border border-border/80 bg-canvas p-3 text-xs space-y-1"
      >
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-ink">{{ req.title }}</h4>
          <span class="text-[10px] text-muted uppercase">{{ req.created_by_role }}</span>
        </div>
        <p v-if="req.description" class="text-muted text-[11px] leading-relaxed">
          {{ req.description }}
        </p>
      </div>
    </div>
  </div>
</template>
