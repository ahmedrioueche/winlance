<script setup lang="ts">
import { FolderKanban } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Project } from '../../types'

interface Props {
  project?: Project
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ project?.title || 'Project Detail' }}
        </h1>
        <span
          class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          :class="project?.status === 'ACTIVE' ? 'bg-accent-soft text-accent border-accent/30' : 'bg-canvas-muted text-muted border-border'"
        >
          {{ project?.status }}
        </span>
      </div>
      <p class="mt-1 text-xs text-muted">
        Workspace parameters, client details, budget, and task deliverables
      </p>
    </div>

    <BaseButton size="sm" @click="$router.push(`/app/projects/${project?.id}/overview`)">
      <FolderKanban class="h-4 w-4" />
      <span>Open Project Workspace</span>
    </BaseButton>
  </div>
</template>
