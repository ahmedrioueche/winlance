import { computed, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useClientQuery } from '../../queries'

import type { ClientProject, ClientProposal } from '../../types'

export function useClientOverviewData(clientId: Ref<string>) {
  const toast = useToast()
  const { data: client, isPending, isError, refetch } = useClientQuery(clientId)

  const projects = computed<ClientProject[]>(() => client.value?.projects ?? [])
  const proposals = computed<ClientProposal[]>(() => client.value?.proposals ?? [])

  const activeProjectsCount = computed(() => projects.value.filter((p) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length)
  const totalProposalsCount = computed(() => proposals.value.length)
  const acceptedProposalsCount = computed(() => proposals.value.filter((p) => p.status === 'ACCEPTED').length)

  const winRatePercent = computed(() => {
    if (totalProposalsCount.value === 0) return 0
    return Math.round((acceptedProposalsCount.value / totalProposalsCount.value) * 100)
  })

  const totalRevenue = computed(() => {
    return projects.value.reduce((acc, p) => acc + (Number(p.budget) || 0), 0)
  })

  function formatCurrency(val: number, currency = 'USD') {
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
  }

  function handleCopyPortalLink() {
    const token = client.value?.portal_token
    const portalUrl = token
      ? `${window.location.origin}/portal/${token}`
      : `${window.location.origin}/portal`
    void navigator.clipboard.writeText(portalUrl)
    toast.success('Client portal link copied to clipboard!')
  }

  return {
    client,
    isPending,
    isError,
    refetch,
    projects,
    proposals,
    activeProjectsCount,
    totalProposalsCount,
    acceptedProposalsCount,
    winRatePercent,
    totalRevenue,
    formatCurrency,
    handleCopyPortalLink,
  }
}
