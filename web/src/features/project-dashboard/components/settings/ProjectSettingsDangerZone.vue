<script setup lang="ts">
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'

defineEmits<{
  openDeleteModal: []
}>()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-error flex items-center gap-2">
        <AlertTriangle class="h-5 w-5 text-error" />
        Danger Zone Actions
      </h2>
      <p class="mt-1 text-xs text-muted">
        Irreversible workspace operations. Please proceed with caution.
      </p>
    </div>

    <div class="rounded-xl border border-error/30 bg-error/5 p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="font-bold text-ink text-sm">Delete Workspace Project</h3>
          <p class="mt-0.5 text-xs text-muted max-w-xl">
            Permanently remove this project workspace, associated deliverables, tasks, milestones, and reports.
            This action cannot be undone.
          </p>
        </div>
        <BaseButton
          variant="primary"
          class="!bg-red-600 !text-white hover:!bg-red-700 shrink-0"
          size="sm"
          @click="$emit('openDeleteModal')"
        >
          <Trash2 class="h-4 w-4" />
          <span>Delete Project</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
