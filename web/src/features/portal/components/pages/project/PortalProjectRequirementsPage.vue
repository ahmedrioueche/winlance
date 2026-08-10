<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ListChecks } from 'lucide-vue-next'

import { EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import { usePortalProjectQuery } from '../../../queries'

const { t } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)
</script>

<template>
  <div v-if="isPending" class="space-y-4">
    <Skeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load requirements')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load project requirements.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-bold tracking-tight text-ink">
        Scope & Requirements
      </h2>
      <p class="text-xs text-muted">
        Functional requirements and scope specifications for this project workspace.
      </p>
    </div>

    <EmptyState
      v-if="!project.requirements || project.requirements.length === 0"
      :title="t('portal.projects.noScopeTitle', 'No Requirements Defined')"
      :description="t('portal.projects.noScopeDescription', 'No specific project requirements or scope items have been listed.')"
    />

    <div v-else class="space-y-3">
      <div
        v-for="req in project.requirements"
        :key="req.id"
        class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft flex items-start gap-3 text-xs"
      >
        <ListChecks class="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div>
          <h4 class="font-semibold text-ink">
            {{ req.title }}
          </h4>
          <p v-if="req.description" class="mt-1 text-muted">
            {{ req.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
