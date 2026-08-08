<script setup lang="ts">
import { FolderKanban, Plus } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { BaseButton, ErrorState, Skeleton } from '@/shared/components/base'

import { useProjectQuery } from '../../queries'

const route = useRoute()
const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const milestones = computed(() => project.value?.milestones ?? [])
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load project milestones"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          Project Milestones
        </h1>
        <p class="mt-1 text-sm text-muted">
          Track phase deliverables, completion progress, and milestone deadlines for {{ project?.title }}
        </p>
      </div>
      <BaseButton size="sm">
        <Plus class="h-3.5 w-3.5" />
        <span>Add Milestone</span>
      </BaseButton>
    </div>

    <div v-if="milestones.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
      No milestones created for this project yet.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="ms in milestones"
        :key="ms.id"
        class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
              <FolderKanban class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-bold text-ink text-base">{{ ms.title }}</h3>
              <p v-if="ms.due_date" class="text-xs text-muted">Due: {{ ms.due_date }}</p>
            </div>
          </div>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase shrink-0"
            :class="ms.status === 'DONE' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-accent-soft text-accent'"
          >
            {{ ms.status }}
          </span>
        </div>

        <p v-if="ms.description" class="text-xs text-muted leading-relaxed">
          {{ ms.description }}
        </p>

        <div class="space-y-1.5 pt-2 border-t border-border/60">
          <div class="flex items-center justify-between text-xs font-medium">
            <span class="text-ink">Completion Progress</span>
            <span class="text-accent font-bold">{{ ms.progress_percent }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-accent rounded-full transition-all duration-500" :style="{ width: `${ms.progress_percent}%` }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
