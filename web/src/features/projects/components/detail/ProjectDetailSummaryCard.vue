<script setup lang="ts">
import { DollarSign, Folder, User } from 'lucide-vue-next'
import type { Project } from '../../types'

interface Props {
  project?: Project
  budgetFormatted: string
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-6">
    <div class="flex items-center justify-between border-b border-border/60 pb-4">
      <div class="flex items-center gap-2 font-display text-base font-bold text-ink">
        <Folder class="h-4 w-4 text-accent" />
        <span>Executive Summary & Scope</span>
      </div>

      <div class="flex items-center gap-1 font-display text-lg font-bold text-ink">
        <DollarSign class="h-4 w-4 text-emerald-500" />
        <span>{{ budgetFormatted }}</span>
      </div>
    </div>

    <div v-if="project?.client_name" class="flex items-center gap-2 text-xs text-muted">
      <User class="h-3.5 w-3.5 text-accent" />
      <span>Client: <strong class="text-ink">{{ project.client_name }}</strong> <template v-if="project.client_email">({{ project.client_email }})</template></span>
    </div>

    <div class="text-xs text-ink-soft leading-relaxed space-y-3 whitespace-pre-wrap">
      {{ project?.summary || 'No executive summary specified.' }}
    </div>
  </div>
</template>
