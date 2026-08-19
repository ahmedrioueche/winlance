import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import * as api from './api'

export const analyticsKeys = {
  funnel: ['analytics', 'funnel'] as const,
  summary: ['analytics', 'summary'] as const,
}

export const useFunnelQuery = () =>
  useQuery({
    queryKey: analyticsKeys.funnel,
    queryFn: api.fetchFunnel,
  })

export const useSummaryQuery = () =>
  useQuery({
    queryKey: analyticsKeys.summary,
    queryFn: api.fetchSummary,
  })

export const useRefreshSnapshotMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.postSnapshot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.funnel })
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.summary })
    },
  })
}
