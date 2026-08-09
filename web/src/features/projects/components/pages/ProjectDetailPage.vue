<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useProjectDetailData } from '../../composables/detail/useProjectDetailData'
import ProjectDetailHeader from '../detail/ProjectDetailHeader.vue'
import ProjectDetailSummaryCard from '../detail/ProjectDetailSummaryCard.vue'

const route = useRoute()
const projectId = computed(() => String(route.params.id || ''))

const {
  project,
  isPending,
  isError,
  refetch,
  budgetFormatted,
} = useProjectDetailData(projectId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load project details"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ProjectDetailHeader :project="project" />
    <ProjectDetailSummaryCard
      :project="project"
      :budget-formatted="budgetFormatted"
    />
  </section>
</template>
