<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Download, Paperclip } from 'lucide-vue-next'

import { BaseButton, EmptyState, ErrorState, Skeleton } from '@/shared/components/base'
import { usePortalProjectQuery } from '../../../queries'

const { t } = useI18n()
const route = useRoute()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)
</script>

<template>
  <div v-if="isPending" class="space-y-4">
    <Skeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError || !project"
    :title="t('portal.projects.detailErrorTitle', 'Failed to load files')"
    :message="t('portal.projects.detailErrorMessage', 'Could not load project files.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-bold tracking-tight text-ink">
        Shared Files & Deliverables
      </h2>
      <p class="text-xs text-muted">
        Download project assets, wireframes, and documentation shared by your freelancer.
      </p>
    </div>

    <EmptyState
      v-if="!project.files || project.files.length === 0"
      :title="t('portal.projects.noFilesTitle', 'No Shared Files')"
      :description="t('portal.projects.noFilesDescription', 'No deliverables or attachments have been shared for this project yet.')"
    />

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="f in project.files"
        :key="f.id"
        class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 truncate">
          <Paperclip class="h-5 w-5 text-accent shrink-0" />
          <div class="truncate">
            <h4 class="font-medium text-xs text-ink truncate">
              {{ f.name }}
            </h4>
            <p v-if="f.notes" class="text-[11px] text-muted truncate">
              {{ f.notes }}
            </p>
          </div>
        </div>

        <a
          v-if="f.url"
          :href="f.url"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0"
        >
          <BaseButton variant="secondary" size="sm">
            <Download class="h-3.5 w-3.5" />
            <span>Download</span>
          </BaseButton>
        </a>
      </div>
    </div>
  </section>
</template>
