<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FilterX, Plus } from 'lucide-vue-next'
import { BaseButton, EmptyState } from '@/shared/components/base'
import type { Project } from '../../types'
import ProjectCard from './ProjectCard.vue'

interface Props {
  projects: Project[]
  hasActiveFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
})

defineEmits<{
  clearFilters: []
  createProject: []
}>()

const { t } = useI18n()

const emptyTitle = computed(() => {
  if (props.hasActiveFilters) {
    return t('projects.noProjectsFoundTitle', 'No Projects Found')
  }
  return t('projects.empty', 'No projects yet')
})

const emptyDescription = computed(() => {
  if (props.hasActiveFilters) {
    return t(
      'projects.noProjectsMatchingFilters',
      'No projects match your current filter criteria. Try resetting filters.',
    )
  }
  return t(
    'projects.noProjectsFound',
    'No projects found. Click New Project to get started.',
  )
})
</script>

<template>
  <div>
    <EmptyState
      v-if="projects.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
    >
      <template #action>
        <BaseButton
          v-if="props.hasActiveFilters"
          variant="secondary"
          size="sm"
          @click="$emit('clearFilters')"
        >
          <FilterX class="h-4 w-4" />
          <span>{{ t('projects.clearFilters', 'Clear Filters') }}</span>
        </BaseButton>

        <BaseButton
          v-else
          size="sm"
          @click="$emit('createProject')"
        >
          <Plus class="h-4 w-4" />
          <span>{{ t('projects.newProject', 'New Project') }}</span>
        </BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
