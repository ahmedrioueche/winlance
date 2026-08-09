<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Project } from '../../types'
import ProjectCard from './ProjectCard.vue'

interface Props {
  projects: Project[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div>
    <div v-if="projects.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
      {{ t('projects.noProjectsFound', 'No projects found. Click "New Project" to get started.') }}
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
