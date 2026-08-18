<script setup lang="ts">
import { Globe, Plus } from 'lucide-vue-next'
import { BaseButton, BasePageHeader } from '@/shared/components/base'
import type { Project } from '../../types'

interface Props {
  project?: Project
  projectId: string
}

defineProps<Props>()

const emit = defineEmits<{
  copyPortalLink: []
}>()
</script>

<template>
  <BasePageHeader
    :title="project?.title || 'Project Workspace'"
    :subtitle="project?.summary || 'Project overview, milestone deliverables, and client scope tracking.'"
  >
    <template #badge>
      <span class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
        {{ project?.status || 'Active' }}
      </span>
    </template>

    <template #actions>
      <BaseButton variant="secondary" size="sm" @click="emit('copyPortalLink')">
        <Globe class="h-3.5 w-3.5 text-accent" />
        <span>Client Portal Link</span>
      </BaseButton>
      <BaseButton size="sm" @click="$router.push(`/app/projects/${projectId}/tasks`)">
        <Plus class="h-3.5 w-3.5" />
        <span>Add Task</span>
      </BaseButton>
    </template>
  </BasePageHeader>
</template>
