<script setup lang="ts">
import type { ProjectTask, TaskStatus } from '../../types'
import ProjectTasksBoardCard from './ProjectTasksBoardCard.vue'

interface Props {
  title: string
  status: TaskStatus
  tasks: ProjectTask[]
  dotClass: string
  draggedTaskId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  dragStart: [taskId: string]
  dropOnColumn: [status: TaskStatus]
  edit: [task: ProjectTask]
  delete: [task: ProjectTask]
}>()
</script>

<template>
  <div
    class="flex flex-col rounded-2xl border border-border/70 bg-canvas-muted/40 p-3 min-h-[500px]"
    @dragover.prevent
    @drop.prevent="emit('dropOnColumn', status)"
  >
    <!-- Column Header -->
    <div class="mb-3 flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full" :class="dotClass" />
        <h2 class="font-bold text-ink text-xs uppercase tracking-wider">
          {{ title }}
        </h2>
      </div>
      <span class="rounded-full bg-canvas-elevated border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
        {{ tasks.length }}
      </span>
    </div>

    <!-- Cards List -->
    <div class="flex-1 space-y-2.5">
      <ProjectTasksBoardCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :is-dragged="draggedTaskId === task.id"
        @drag-start="emit('dragStart', $event)"
        @edit="emit('edit', task)"
        @delete="emit('delete', task)"
      />

      <div
        v-if="tasks.length === 0"
        class="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/60 text-[11px] text-muted/60"
      >
        No tasks
      </div>
    </div>
  </div>
</template>
