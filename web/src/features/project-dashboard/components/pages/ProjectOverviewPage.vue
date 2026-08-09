<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useOverviewData } from '../../composables/overview/useOverviewData'
import ProjectOverviewHeader from '../overview/ProjectOverviewHeader.vue'
import ProjectOverviewMetrics from '../overview/ProjectOverviewMetrics.vue'
import ProjectOverviewMilestones from '../overview/ProjectOverviewMilestones.vue'
import ProjectOverviewRequirements from '../overview/ProjectOverviewRequirements.vue'

const route = useRoute()
const projectId = computed(() => String(route.params.id || ''))

const {
  project,
  isPending,
  isError,
  refetch,
  milestones,
  requirements,
  completedMilestones,
  overallProgressPercent,
  formatCurrency,
  handleCopyPortalLink,
} = useOverviewData(projectId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-32 w-full rounded-2xl" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" />
    </div>
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load project details"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-8">
    <ProjectOverviewHeader
      :project="project"
      :project-id="projectId"
      @copy-portal-link="handleCopyPortalLink"
    />

    <ProjectOverviewMetrics
      :project="project"
      :overall-progress-percent="overallProgressPercent"
      :completed-milestones="completedMilestones"
      :milestones-count="milestones.length"
      :formatted-budget="formatCurrency(project?.budget, project?.currency)"
    />

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="lg:col-span-8 space-y-6">
        <ProjectOverviewMilestones
          :milestones="milestones"
          :project-id="projectId"
        />
      </div>

      <div class="lg:col-span-4 space-y-6">
        <ProjectOverviewRequirements
          :requirements="requirements"
        />
      </div>
    </div>
  </section>
</template>
