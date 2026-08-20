import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import { useClientsQuery, useCreateClientMutation } from '../../queries'
import type { Client } from '../../types'

export function useClientsList() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const { data: clientsData, isPending, isError, refetch } = useClientsQuery()
  const createClientMutation = useCreateClientMutation()

  // Filter & Search reactive state initialized from URL query parameters
  const searchQuery = ref((route.query.q as string) || '')
  const statusFilter = ref((route.query.status as string) || '')
  const dateFilter = ref((route.query.date as string) || '')
  const startDate = ref((route.query.from as string) || '')
  const endDate = ref((route.query.to as string) || '')
  const sortBy = ref((route.query.sort as string) || 'created_desc')

  // Modal form state
  const isModalOpen = ref(false)
  const name = ref('')
  const companyName = ref('')
  const email = ref('')
  const phone = ref('')
  const notes = ref('')

  // Sync state changes back to URL query parameters
  watch(
    [searchQuery, statusFilter, dateFilter, startDate, endDate, sortBy],
    ([q, status, date, from, to, sort]) => {
      const query: Record<string, string> = {}
      if (q) query.q = q
      if (status) query.status = status
      if (date) query.date = date
      if (date === 'CUSTOM') {
        if (from) query.from = from
        if (to) query.to = to
      }
      if (sort && sort !== 'created_desc') query.sort = sort

      void router.replace({ query })
    },
  )

  const clients = computed<Client[]>(() => {
    if (!clientsData.value) return []
    if ('results' in clientsData.value && Array.isArray(clientsData.value.results)) {
      return clientsData.value.results
    }
    if (Array.isArray(clientsData.value)) {
      return clientsData.value
    }
    return []
  })

  const hasActiveFilters = computed(() => {
    return Boolean(
      searchQuery.value.trim() ||
        statusFilter.value ||
        dateFilter.value ||
        startDate.value ||
        endDate.value,
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value.trim()) count++
    if (statusFilter.value) count++
    if (dateFilter.value) count++
    if (dateFilter.value === 'CUSTOM' && (startDate.value || endDate.value)) count++
    return count
  })

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    dateFilter.value = ''
    startDate.value = ''
    endDate.value = ''
    sortBy.value = 'created_desc'
  }

  const filteredClients = computed(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const list = clients.value.filter((c) => {
      // 1. Text Search Filter
      const q = searchQuery.value.trim().toLowerCase()
      if (q) {
        const nameMatch = (c.name || '').toLowerCase().includes(q)
        const companyMatch = (c.company_name || '').toLowerCase().includes(q)
        const emailMatch = (c.email || '').toLowerCase().includes(q)
        const phoneMatch = (c.phone || '').toLowerCase().includes(q)
        const locationMatch = (c.location || '').toLowerCase().includes(q)
        const industryMatch = (c.industry || '').toLowerCase().includes(q)
        const notesMatch = (c.notes || '').toLowerCase().includes(q)
        if (
          !nameMatch &&
          !companyMatch &&
          !emailMatch &&
          !phoneMatch &&
          !locationMatch &&
          !industryMatch &&
          !notesMatch
        ) {
          return false
        }
      }

      // 2. Status Filter
      if (statusFilter.value && c.status !== statusFilter.value) {
        return false
      }

      // 3. Date Filter
      if (dateFilter.value) {
        const rawDate = c.created_at || c.start_date
        if (!rawDate) return false
        const cDate = new Date(rawDate)

        if (dateFilter.value === 'THIS_MONTH') {
          if (cDate.getFullYear() !== currentYear || cDate.getMonth() !== currentMonth) {
            return false
          }
        } else if (dateFilter.value === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (cDate < thirtyDaysAgo) {
            return false
          }
        } else if (dateFilter.value === 'THIS_YEAR') {
          if (cDate.getFullYear() !== currentYear) {
            return false
          }
        } else if (dateFilter.value === 'CUSTOM') {
          if (startDate.value) {
            const start = new Date(startDate.value)
            if (cDate < start) return false
          }
          if (endDate.value) {
            const end = new Date(`${endDate.value}T23:59:59`)
            if (cDate > end) return false
          }
        }
      }

      return true
    })

    // 4. Sort
    return list.sort((a, b) => {
      if (sortBy.value === 'created_asc') {
        const dA = new Date(a.created_at || 0).getTime()
        const dB = new Date(b.created_at || 0).getTime()
        return dA - dB
      }
      if (sortBy.value === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy.value === 'company_asc') {
        return (a.company_name || '').localeCompare(b.company_name || '')
      }
      // default: created_desc
      const dA = new Date(a.created_at || 0).getTime()
      const dB = new Date(b.created_at || 0).getTime()
      return dB - dA
    })
  })

  function handleOpenCreateModal() {
    name.value = ''
    companyName.value = ''
    email.value = ''
    phone.value = ''
    notes.value = ''
    isModalOpen.value = true
  }

  async function handleSaveClient() {
    if (!name.value.trim()) return

    try {
      await createClientMutation.mutateAsync({
        name: name.value.trim(),
        company_name: companyName.value.trim(),
        email: email.value.trim() || undefined,
        phone: phone.value.trim(),
        notes: notes.value.trim(),
      })
      toast.success('clients.createdToast')
      isModalOpen.value = false
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    clients,
    filteredClients,
    isPending,
    isError,
    refetch,
    searchQuery,
    statusFilter,
    dateFilter,
    startDate,
    endDate,
    sortBy,
    hasActiveFilters,
    activeFiltersCount,
    clearFilters,
    isModalOpen,
    name,
    companyName,
    email,
    phone,
    notes,
    isSaving: createClientMutation.isPending,
    handleOpenCreateModal,
    handleSaveClient,
  }
}
