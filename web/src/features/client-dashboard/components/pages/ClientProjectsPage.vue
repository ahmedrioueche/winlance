<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CreateProjectModal from '@/features/projects/components/CreateProjectModal.vue'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useClientProjectsData } from '../../composables/projects/useClientProjectsData'
import ClientProjectsHeader from '../projects/ClientProjectsHeader.vue'
import ClientProjectsList from '../projects/ClientProjectsList.vue'

const route = useRoute()
const clientId = computed(() => String(route.params.id || ''))

const {
  client,
  filteredProjects,
  isPending,
  isError,
  refetch,
  searchQuery,
  isModalOpen,
  handleOpenCreateModal,
  handleProjectCreated,
} = useClientProjectsData(clientId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-24 w-full rounded-2xl" />
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load client projects"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-6">
    <ClientProjectsHeader
      :client="client"
      @create-project="handleOpenCreateModal"
    />

    <ClientProjectsList
      v-model:search-query="searchQuery"
      :projects="filteredProjects"
    />

    <!-- Create Project Modal with Preset Client -->
    <CreateProjectModal
      :open="isModalOpen"
      :preset-client-name="client?.name"
      :preset-client-email="client?.email"
      @close="isModalOpen = false"
      @created="handleProjectCreated"
    />
  </section>
</template>
