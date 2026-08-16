<script setup lang="ts">
import { Calendar, DollarSign, FolderKanban } from 'lucide-vue-next'
import type { ClientProject } from '../../types'

interface Props {
  project: ClientProject
}

defineProps<Props>()
</script>

<template>
  <div
    class="group rounded-2xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-4 cursor-pointer hover:border-accent/40 hover:shadow-lift transition-all"
    @click="$router.push({ path: `/app/projects/${project.id}/overview`, query: { from: $route.path } })"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 truncate">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent shrink-0">
          <FolderKanban class="h-5 w-5" />
        </div>
        <div class="truncate">
          <h3 class="font-bold text-ink text-base truncate group-hover:text-accent transition-colors">
            {{ project.title }}
          </h3>
          <span class="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold text-accent uppercase">
            {{ project.status }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="project.summary" class="text-xs text-muted leading-relaxed line-clamp-2">
      {{ project.summary }}
    </p>

    <div class="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
      <span v-if="project.budget" class="inline-flex items-center gap-1 font-semibold text-ink">
        <DollarSign class="h-3.5 w-3.5 text-emerald-500" />
        <span>${{ Number(project.budget).toLocaleString() }} USD</span>
      </span>

      <span v-if="project.due_date" class="inline-flex items-center gap-1 text-[11px]">
        <Calendar class="h-3.5 w-3.5 text-accent" />
        <span>{{ project.due_date }}</span>
      </span>
    </div>
  </div>
</template>
