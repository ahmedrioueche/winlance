<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import { usePortalProjectQuery } from '../../../queries'

const { t, d } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div v-if="isPending" class="space-y-4">
    <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load reports')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load status reports.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-bold tracking-tight text-ink">
        Status Reports & Progress Updates
      </h2>
      <p class="text-xs text-muted">
        Weekly summaries, progress updates, and notes published by your freelancer.
      </p>
    </div>

    <EmptyState
      v-if="!project.reports || project.reports.length === 0"
      :title="t('portal.projects.noReportsTitle', 'No Status Reports')"
      :description="t('portal.projects.noReportsDescription', 'No client status updates or progress reports have been published yet.')"
    />

    <div v-else class="space-y-4">
      <div
        v-for="r in project.reports"
        :key="r.id"
        class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-3"
      >
        <div class="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
          <h4 class="font-display text-base font-bold text-ink">
            {{ r.title }}
          </h4>
          <span v-if="r.created_at" class="text-xs text-muted font-mono">
            {{ formatDate(r.created_at) }}
          </span>
        </div>
        <p class="text-xs text-ink-soft whitespace-pre-line leading-relaxed">
          {{ r.body }}
        </p>
      </div>
    </div>
  </section>
</template>
