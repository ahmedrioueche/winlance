<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ErrorState } from '@/shared/components/base'
import { useProjectsList } from '../../composables/list/useProjectsList'
import CreateProjectModal from '../create/CreateProjectModal.vue'
import ProjectsListFilterBar from '../list/ProjectsListFilterBar.vue'
import ProjectsListGrid from '../list/ProjectsListGrid.vue'
import ProjectsListHeader from '../list/ProjectsListHeader.vue'
import ProjectsSkeleton from '../list/ProjectsSkeleton.vue'

const router = useRouter()

const {
  filteredProjects,
  clientOptions,
  isPending,
  isError,
  refetch,
  searchQuery,
  statusFilter,
  clientFilter,
  dateFilter,
  startDate,
  endDate,
  sortBy,
  hasActiveFilters,
  activeFiltersCount,
  clearFilters,
  isModalOpen,
  handleOpenCreateModal,
} = useProjectsList()

function handleProjectCreated(newProjectId: string) {
  void router.push({ name: 'project-workspace-overview', params: { id: newProjectId } })
}
</script>

<template>
  <ProjectsSkeleton v-if="isPending" />

  <ErrorState
    v-else-if="isError"
    title="Failed to load projects"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ProjectsListHeader @create-project="handleOpenCreateModal" />

    <ProjectsListFilterBar
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:client-filter="clientFilter"
      v-model:date-filter="dateFilter"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      v-model:sort-by="sortBy"
      :client-options="clientOptions"
      :has-active-filters="hasActiveFilters"
      :active-filters-count="activeFiltersCount"
      @clear-filters="clearFilters"
    />

    <ProjectsListGrid
      :projects="filteredProjects"
      :has-active-filters="hasActiveFilters"
      @clear-filters="clearFilters"
      @create-project="handleOpenCreateModal"
    />

    <!-- Create Project Modal -->
    <CreateProjectModal
      :open="isModalOpen"
      @close="isModalOpen = false"
      @created="handleProjectCreated"
    />
  </section>
</template>
