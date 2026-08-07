<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { BaseButton, BaseInput, BaseSelect, EmptyState, ErrorState } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import Pagination from '@/shared/components/composite/Pagination.vue'
import { usePagination } from '@/shared/composables/usePagination'

import { useClientsQuery } from '@/features/client-dashboard'
import { useProjectsQuery } from '../queries'
import type { Project } from '../types'
import CreateProjectModal from './CreateProjectModal.vue'
import ProjectCard from './ProjectCard.vue'
import ProjectsSkeleton from './ProjectsSkeleton.vue'

const { t } = useI18n()
const router = useRouter()

// Modal state
const isModalOpen = ref(false)

// Pagination composable
const { page, pageSize, setPage } = usePagination({
  defaultPage: 1,
  defaultPageSize: 9,
  syncToQuery: true,
})

// Search & Filter state
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedClient = ref('')

// Query projects & clients
const { data, isPending, isError, refetch } = useProjectsQuery(
  computed(() => ({
    page: page.value,
    page_size: pageSize.value,
  })),
)
const { data: clientsData } = useClientsQuery({ page_size: 100 })
const dbClients = computed(() => clientsData.value?.results ?? [])

// Raw results from backend
const rawProjects = computed<Project[]>(() => data.value?.results ?? [])
const totalCount = computed(() => data.value?.count ?? 0)

// Dynamic Client Filter Options
const clientOptions = computed<SelectOption[]>(() => {
  const clients = new Set<string>()
  rawProjects.value.forEach((p) => {
    if (p.client_name?.trim()) clients.add(p.client_name.trim())
  })
  dbClients.value.forEach((c) => {
    if (c.name?.trim()) clients.add(c.name.trim())
  })
  const options: SelectOption[] = [
    { value: '', label: t('projects.allClients', 'All Clients') },
  ]
  clients.forEach((client) => {
    options.push({ value: client, label: client })
  })
  return options
})

// Clients list for CreateProjectModal
const availableClients = computed(() => {
  const map = new Map<string, string | undefined>()
  dbClients.value.forEach((c) => {
    if (c.name?.trim()) {
      map.set(c.name.trim(), c.email?.trim() || undefined)
    }
  })
  rawProjects.value.forEach((p) => {
    if (p.client_name?.trim() && !map.has(p.client_name.trim())) {
      map.set(p.client_name.trim(), p.client_email?.trim() || undefined)
    }
  })
  return Array.from(map.entries()).map(([name, email]) => ({ name, email }))
})

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
      (project.summary && project.summary.toLowerCase().includes(q)) ||
      (project.client_name && project.client_name.toLowerCase().includes(q)) ||
      (project.client_email && project.client_email.toLowerCase().includes(q))

    // Status match
    const matchesStatus =
      !selectedStatus.value || project.status === selectedStatus.value

    // Client match
    const matchesClient =
      !selectedClient.value || project.client_name === selectedClient.value

    return matchesSearch && matchesStatus && matchesClient
  })
})

// Reset to page 1 on search or filter change
watch([searchQuery, selectedStatus, selectedClient], () => {
  setPage(1)
})

function handleProjectCreated(newProjectId: string) {
  refetch()
  void router.push({ name: 'project-detail', params: { id: newProjectId } })
}
</script>

<template>
  <section class="w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
          {{ t('projects.title') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('projects.subtitle') }}
        </p>
      </div>

      <BaseButton class="shrink-0" @click="isModalOpen = true">
        <span aria-hidden="true">+</span>
        {{ t('projects.create') }}
      </BaseButton>
    </div>

    <!-- Search & Filter Controls -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-12 items-start">
      <!-- Search Input -->
      <div class="sm:col-span-6 lg:col-span-6">
        <BaseInput
          v-model="searchQuery"
          :label="t('projects.searchPlaceholder', 'Search projects...')"
          :placeholder="t('projects.searchPlaceholder', 'Search by title, client, summary...')"
        />
      </div>

      <!-- Status Filter -->
      <div class="sm:col-span-3 lg:col-span-3">
        <BaseSelect
          v-model="selectedStatus"
          :label="t('projects.filterByStatus', 'Filter by status')"
          :options="statusOptions"
        />
      </div>

      <!-- Client Filter -->
      <div class="sm:col-span-3 lg:col-span-3">
        <BaseSelect
          v-model="selectedClient"
          :label="t('projects.filterByClient', 'Filter by client')"
          :options="clientOptions"
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
      :title="t('projects.empty')"
      :description="t('projects.emptyDescription')"
    >
      <template #action>
        <BaseButton @click="isModalOpen = true">
          {{ t('projects.create') }}
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Success State: Cards Grid -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
        />
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

    <!-- Create Project Modal -->
    <CreateProjectModal
      :open="isModalOpen"
      :clients="availableClients"
      @close="isModalOpen = false"
      @created="handleProjectCreated"
    />
  </section>
</template>