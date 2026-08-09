import { computed, ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useClientsQuery, useCreateClientMutation } from '../../queries'
import type { Client } from '../../types'

export function useClientsList() {
  const toast = useToast()
  const { data: clientsData, isPending, isError, refetch } = useClientsQuery()
  const createClientMutation = useCreateClientMutation()

  const searchQuery = ref('')
  const statusFilter = ref<string>('')

  const isModalOpen = ref(false)
  const name = ref('')
  const companyName = ref('')
  const email = ref('')
  const phone = ref('')
  const notes = ref('')

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

  const filteredClients = computed(() => {
    return clients.value.filter((c) => {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.company_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)

      const matchesStatus = !statusFilter.value || c.status === statusFilter.value
      return matchesSearch && matchesStatus
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
    if (!name.value.trim() || !email.value.trim()) return

    try {
      await createClientMutation.mutateAsync({
        name: name.value.trim(),
        company_name: companyName.value.trim(),
        email: email.value.trim(),
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
