<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FolderKanban } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { ClientProject } from '../../types'

interface Props {
  projects: ClientProject[]
  clientId: string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
    <div class="flex items-center justify-between border-b border-border/60 pb-3">
      <div>
        <h2 class="font-display text-base font-bold text-ink">{{ t('clients.overview.projectsTitle') }}</h2>
        <p class="text-xs text-muted">Active client deliverables and contracted scope</p>
      </div>
      <BaseButton variant="secondary" size="sm" @click="$router.push(`/app/clients/${clientId}/projects`)">
        {{ t('clients.overview.viewAll') }}
      </BaseButton>
    </div>

    <div v-if="projects.length === 0" class="text-xs text-muted text-center py-8">
      {{ t('clients.overview.noProjects') }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="p in projects"
        :key="p.id"
        class="rounded-xl border border-border/80 bg-canvas p-4 text-xs flex items-center justify-between gap-4 cursor-pointer hover:border-accent/40 transition"
        @click="$router.push({ path: `/app/projects/${p.id}/overview`, query: { from: $route.path } })"
      >
        <div class="flex items-center gap-3 truncate">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent shrink-0">
            <FolderKanban class="h-4 w-4" />
          </div>
          <div class="truncate">
            <h3 class="font-bold text-ink truncate">{{ p.title }}</h3>
            <p v-if="p.summary" class="text-muted text-[11px] truncate">{{ p.summary }}</p>
          </div>
        </div>
        <span class="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold text-accent uppercase shrink-0">
          {{ p.status }}
        </span>
      </div>
    </div>
  </div>
</template>
