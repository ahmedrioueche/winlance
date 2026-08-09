import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsQuery } from '../../queries'
import type { Project } from '../../types'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'

export function useProjectsList() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const { data: projectsData, isPending, isError, refetch } = useProjectsQuery({})

  // Filter & Search reactive state initialized from URL query parameters
  const searchQuery = ref((route.query.q as string) || '')
  const statusFilter = ref((route.query.status as string) || '')
  const clientFilter = ref((route.query.client as string) || '')
  const dateFilter = ref((route.query.date as string) || '')
  const startDate = ref((route.query.from as string) || '')
  const endDate = ref((route.query.to as string) || '')
  const sortBy = ref((route.query.sort as string) || 'created_desc')

  const isModalOpen = ref(false)

  // Sync state changes back to URL query parameters
  watch(
    [searchQuery, statusFilter, clientFilter, dateFilter, startDate, endDate, sortBy],
    ([q, status, client, date, from, to, sort]) => {
      const query: Record<string, string> = {}
      if (q) query.q = q
      if (status) query.status = status
      if (client) query.client = client
      if (date) query.date = date
      if (date === 'CUSTOM') {
        if (from) query.from = from
        if (to) query.to = to
      }
      if (sort && sort !== 'created_desc') query.sort = sort

      void router.replace({ query })
    },
  )

  const projects = computed<Project[]>(() => {
    if (!projectsData.value) return []
    if ('results' in projectsData.value && Array.isArray(projectsData.value.results)) {
      return projectsData.value.results
    }
    if (Array.isArray(projectsData.value)) {
      return projectsData.value
    }
    return []
  })

  // Dynamic unique client list extracted from projects
  const clientOptions = computed<SelectOption[]>(() => {
    const clients = new Set<string>()
    for (const p of projects.value) {
      if (p.client_name && p.client_name.trim()) {
        clients.add(p.client_name.trim())
      }
    }
    const sortedClients = Array.from(clients).sort((a, b) => a.localeCompare(b))
    return [
      { value: '', label: t('projects.allClients', 'All Clients') },
      ...sortedClients.map((client) => ({ value: client, label: client })),
    ]
  })

  const hasActiveFilters = computed(() => {
    return Boolean(
      searchQuery.value.trim() ||
        statusFilter.value ||
        clientFilter.value ||
        dateFilter.value ||
        startDate.value ||
        endDate.value,
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value.trim()) count++
    if (statusFilter.value) count++
    if (clientFilter.value) count++
    if (dateFilter.value) count++
    if (dateFilter.value === 'CUSTOM' && (startDate.value || endDate.value)) count++
    return count
  })

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    clientFilter.value = ''
    dateFilter.value = ''
    startDate.value = ''
    endDate.value = ''
    sortBy.value = 'created_desc'
  }

  const filteredProjects = computed(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const list = projects.value.filter((p) => {
      // 1. Text Search Filter
      const q = searchQuery.value.trim().toLowerCase()
      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q)
        const summaryMatch = (p.summary || '').toLowerCase().includes(q)
        const clientNameMatch = (p.client_name || '').toLowerCase().includes(q)
        const clientEmailMatch = (p.client_email || '').toLowerCase().includes(q)
        if (!titleMatch && !summaryMatch && !clientNameMatch && !clientEmailMatch) {
          return false
        }
      }

      // 2. Status Filter
      if (statusFilter.value && p.status !== statusFilter.value) {
        return false
      }

      // 3. Client Filter
      if (clientFilter.value) {
        if ((p.client_name || '').trim().toLowerCase() !== clientFilter.value.trim().toLowerCase()) {
          return false
        }
      }

      // 4. Date Filter
      if (dateFilter.value) {
        const rawDate = p.created_at || p.start_date || p.due_date
        if (!rawDate) return false
        const pDate = new Date(rawDate)

        if (dateFilter.value === 'THIS_MONTH') {
          if (pDate.getFullYear() !== currentYear || pDate.getMonth() !== currentMonth) {
            return false
          }
        } else if (dateFilter.value === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (pDate < thirtyDaysAgo) {
            return false
          }
        } else if (dateFilter.value === 'THIS_YEAR') {
          if (pDate.getFullYear() !== currentYear) {
            return false
          }
        } else if (dateFilter.value === 'CUSTOM') {
          if (startDate.value) {
            const start = new Date(startDate.value)
            if (pDate < start) return false
          }
          if (endDate.value) {
            const end = new Date(`${endDate.value}T23:59:59`)
            if (pDate > end) return false
          }
        }
      }

      return true
    })

    // 5. Sort
    return list.sort((a, b) => {
      if (sortBy.value === 'created_asc') {
        const dA = new Date(a.created_at || 0).getTime()
        const dB = new Date(b.created_at || 0).getTime()
        return dA - dB
      }
      if (sortBy.value === 'due_asc') {
        const dA = a.due_date ? new Date(a.due_date).getTime() : Infinity
        const dB = b.due_date ? new Date(b.due_date).getTime() : Infinity
        return dA - dB
      }
      if (sortBy.value === 'title_asc') {
        return a.title.localeCompare(b.title)
      }
      // default: created_desc
      const dA = new Date(a.created_at || 0).getTime()
      const dB = new Date(b.created_at || 0).getTime()
      return dB - dA
    })
  })

  function handleOpenCreateModal() {
    isModalOpen.value = true
  }

  return {
    projects,
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
  }
}
