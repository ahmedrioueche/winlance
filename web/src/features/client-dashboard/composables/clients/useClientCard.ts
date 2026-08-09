import { computed, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import type { Client } from '../../types'

export function useClientCard(client: Ref<Client>) {
  const toast = useToast()

  const initials = computed(() => {
    if (!client.value.name) return 'CL'
    const parts = client.value.name.trim().split(' ')
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return client.value.name.substring(0, 2).toUpperCase()
  })

  function handleCopyPortalLink() {
    const portalUrl = `${window.location.origin}/portal`
    void navigator.clipboard.writeText(portalUrl)
    toast.success('clients.portalCopiedToast')
  }

  return {
    initials,
    handleCopyPortalLink,
  }
}
