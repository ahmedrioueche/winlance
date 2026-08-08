<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { BaseButton, BaseInput, BaseSelect, EmptyState, ErrorState } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import Pagination from '@/shared/components/composite/Pagination.vue'
import { usePagination } from '@/shared/composables/usePagination'

import { useClientQuery } from '@/features/client-dashboard/queries'
import CreateProjectModal from '@/features/projects/components/CreateProjectModal.vue'
import ProjectCard from '@/features/projects/components/ProjectCard.vue'
import ProjectsSkeleton from '@/features/projects/components/ProjectsSkeleton.vue'
import { useProjectsQuery } from '@/features/projects/queries'
import type { Project } from '@/features/projects/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const clientId = computed(() => String(route.params.id || ''))
const { data: client } = useClientQuery(clientId)

// Modal state
const isModalOpen = ref(false)

// Pagination composable
const { page, pageSize, setPage } = usePagination({
  defaultPage: 1,
  defaultPageSize: 12,
  syncToQuery: true,
})

// Search & Status Filter state (No Client filter needed in client workspace)
const searchQuery = ref('')
const selectedStatus = ref('')

// Query projects
const { data: projectsData, isPending, isError, refetch } = useProjectsQuery(
  computed(() => ({
    page: page.value,
    page_size: pageSize.value,
  })),
)

// Filter projects belonging to this client
const rawProjects = computed<Project[]>(() => {
  const list = projectsData.value?.results ?? []
  if (!client.value) return list

  const cName = client.value.name.trim().toLowerCase()
  const cCompany = client.value.company_name?.trim().toLowerCase()
  const cEmail = client.value.email?.trim().toLowerCase()

  return list.filter((p) => {
    const pName = p.client_name?.trim().toLowerCase()
    const pEmail = p.client_email?.trim().toLowerCase()
    return (
      (pName && (pName === cName || (cCompany && pName === cCompany))) ||
      (pEmail && cEmail && pEmail === cEmail)
    )
  })
})

const totalCount = computed(() => rawProjects.value.length)

// Status Filter Options
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('projects.allStatuses', 'All Statuses') },
  { value: 'ACTIVE', label: t('projects.status.active', 'Active') },
  { value: 'DRAFT', label: t('projects.status.draft', 'Draft') },
  { value: 'ON_HOLD', label: t('projects.status.on_hold', 'On Hold') },
  { value: 'COMPLETED', label: t('projects.status.completed', 'Completed') },
  { value: 'CANCELLED', label: t('projects.status.cancelled', 'Cancelled') },
])

// Filtered Projects
const filteredProjects = computed(() => {
  return rawProjects.value.filter((project) => {
    // Search match
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      project.title.toLowerCase().includes(q) ||
      (project.summary && project.summary.toLowerCase().includes(q))

    // Status match
    const matchesStatus =
      !selectedStatus.value || project.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

// Active Projects (Top Priority Featured Section)
const activeProjects = computed(() =>
  filteredProjects.value.filter((p) => p.status === 'ACTIVE'),
)

// Explicit Status Grouping for Non-Active Projects (Option 2)
interface NonActiveGroup {
  status: string
  title: string
  projects: Project[]
}

const statusTitleMap: Record<string, string> = {
  DRAFT: t('projects.status.draftProjects', 'Draft Projects'),
  ON_HOLD: t('projects.status.onHoldProjects', 'On Hold Projects'),
  COMPLETED: t('projects.status.completedProjects', 'Completed Projects'),
  CANCELLED: t('projects.status.cancelledProjects', 'Cancelled Projects'),
}

const nonActiveGroups = computed<NonActiveGroup[]>(() => {
  const groups: Record<string, Project[]> = {}

  filteredProjects.value
    .filter((p) => p.status !== 'ACTIVE')
    .forEach((p) => {
      const st = p.status || 'DRAFT'
      if (!groups[st]) groups[st] = []
      groups[st].push(p)
    })

  const order = ['DRAFT', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
  const result: NonActiveGroup[] = []

  order.forEach((st) => {
    if (groups[st] && groups[st].length > 0) {
      result.push({
        status: st,
        title: `${statusTitleMap[st] || st} (${groups[st].length})`,
        projects: groups[st],
      })
    }
  })

  return result
})

// Reset to page 1 on search or filter change
watch([searchQuery, selectedStatus], () => {
  setPage(1)
})

function handleProjectCreated(newProjectId: string) {
  refetch()
  void router.push({ name: 'project-workspace-overview', params: { id: newProjectId } })
}
</script>

<template>
  <section class="w-full space-y-6">
    <!-- Header Row -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {{ client?.name ? `${client.name} Projects` : t('projects.title', 'Client Projects') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Manage all active deliverables, project scopes, and milestones for {{ client?.name || 'this client' }}
        </p>
      </div>

      <BaseButton class="shrink-0" @click="isModalOpen = true">
        <span aria-hidden="true">+</span>
        {{ t('projects.create', 'New Project') }}
      </BaseButton>
    </div>

    <!-- Search & Filter Controls (Status filter & Search only) -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-12 items-start">
      <!-- Search Input -->
      <div class="sm:col-span-8 lg:col-span-9">
        <BaseInput
          v-model="searchQuery"
          :label="t('projects.searchPlaceholder', 'Search projects...')"
          :placeholder="t('projects.searchPlaceholder', 'Search by title or summary...')"
        />
      </div>

      <!-- Status Filter -->
      <div class="sm:col-span-4 lg:col-span-3">
        <BaseSelect
          v-model="selectedStatus"
          :label="t('projects.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>
    </div>

    <!-- View States -->
    <!-- Loading State -->
    <ProjectsSkeleton v-if="isPending" class="mt-6" />

    <!-- Error State -->
    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :title="t('common.errors.generic', 'Failed to load projects')"
      :message="t('common.errors.network', 'Please check your connection and try again.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredProjects.length === 0"
      class="mt-6"
      :title="t('projects.empty', 'No projects found')"
      :description="t('projects.emptyDescription', 'Get started by creating a new project for this client.')"
    >
      <template #action>
        <BaseButton @click="isModalOpen = true">
          {{ t('projects.create', 'New Project') }}
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Success State: Priority Layout -->
    <div v-else class="space-y-8">
      <!-- Active Projects Section (Priority Wide Cards) -->
      <div v-if="activeProjects.length > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <h2 class="font-display text-lg font-bold text-ink">
            Active Projects ({{ activeProjects.length }})
          </h2>
        </div>

        <!-- Featured Wide Grid: 1 col on mobile, 2 cols on desktop for wider visibility -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProjectCard
            v-for="project in activeProjects"
            :key="project.id"
            :project="project"
            class="border-accent/30 shadow-soft hover:border-accent/60"
          />
        </div>
      </div>

      <!-- Non-Active Projects Groups (Draft Projects, Completed Projects, On Hold Projects) -->
      <div
        v-for="group in nonActiveGroups"
        :key="group.status"
        class="space-y-3 pt-2"
      >
        <h2 class="font-display text-lg font-bold text-ink">
          {{ group.title }}
        </h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            v-for="project in group.projects"
            :key="project.id"
            :project="project"
          />
        </div>
      </div>

      <!-- Reusable Pagination -->
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalCount"
        :disabled="isPending"
        @update:page="setPage"
      />
    </div>

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
