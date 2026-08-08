<script setup lang="ts">
import { Files, Upload } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { BaseButton, ErrorState, Skeleton } from '@/shared/components/base'

import { useProjectQuery } from '../../queries'

const route = useRoute()
const projectId = computed(() => String(route.params.id || ''))
const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

const files = computed(() => project.value?.files ?? [])
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load project files"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          Project Assets & Files
        </h1>
        <p class="mt-1 text-sm text-muted">
          Manage project design assets, specifications, and documentation for {{ project?.title }}
        </p>
      </div>
      <BaseButton size="sm">
        <Upload class="h-3.5 w-3.5" />
        <span>Upload File</span>
      </BaseButton>
    </div>

    <div v-if="files.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
      No files uploaded for this project yet.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="file in files"
        :key="file.id"
        class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-2 text-xs"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
            <Files class="h-4 w-4" />
          </div>
          <div class="truncate">
            <h4 class="font-bold text-ink truncate">{{ file.name }}</h4>
            <a :href="file.url" target="_blank" class="text-accent hover:underline text-[11px] truncate block">Open File</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
