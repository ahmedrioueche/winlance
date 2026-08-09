<script setup lang="ts">
import { Globe, Plus } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Project } from '../../types'

interface Props {
  project?: Project
  projectId: string
}

defineProps<Props>()

const emit = defineEmits<{
  copyPortalLink: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div class="space-y-1">
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ project?.title || 'Project Workspace' }}
        </h1>
        <span class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
          {{ project?.status || 'Active' }}
        </span>
      </div>
      <p class="text-sm text-muted">
        {{ project?.summary || 'Project overview, milestone deliverables, and client scope tracking.' }}
      </p>
    </div>

    <!-- Quick Action Controls -->
    <div class="flex shrink-0 items-center gap-2.5">
      <BaseButton variant="secondary" size="sm" @click="emit('copyPortalLink')">
        <Globe class="h-3.5 w-3.5 text-accent" />
        <span>Client Portal Link</span>
      </BaseButton>
      <BaseButton size="sm" @click="$router.push(`/app/projects/${projectId}/tasks`)">
        <Plus class="h-3.5 w-3.5" />
        <span>Add Task</span>
      </BaseButton>
    </div>
  </div>
</template>
