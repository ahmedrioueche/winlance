import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'

export const clientKeys = {
  all: ['clients'] as const,
  list: (p: api.ClientListParams) => ['clients', 'list', p] as const,
  detail: (id: string) => ['clients', 'detail', id] as const,
  overview: (id: string) => ['clients', 'overview', id] as const,
}

export const useClientsQuery = (p: MaybeRefOrGetter<api.ClientListParams> = {}) =>
  useQuery({
    queryKey: computed(() => clientKeys.list(toValue(p))),
    queryFn: () => api.fetchClients(toValue(p)),
  })

export const useClientQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => clientKeys.detail(toValue(id))),
    queryFn: () => api.fetchClient(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

export const useClientOverviewQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => clientKeys.overview(toValue(id))),
    queryFn: () => api.fetchClientOverview(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

export const useCreateClientMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createClient,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}
