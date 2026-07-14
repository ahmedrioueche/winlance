import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'

export const portalKeys = {
  detail: (token: string) => ['portal', token] as const,
}

export const usePortalQuery = (token: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => portalKeys.detail(toValue(token))),
    queryFn: () => api.fetchPortal(toValue(token)),
    retry: false,
  })

function usePortalMutation<T>(fn: (vars: T) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['portal'] })
    },
  })
}

export const useCreatePortalRequirementMutation = () =>
  usePortalMutation(api.createRequirement)

export const useUpdatePortalRequirementMutation = () =>
  usePortalMutation(api.updateRequirement)

export const usePortalActionMutation = () =>
  usePortalMutation(
    ({ token, action }: { token: string; action: 'accept-offer' | 'accept-contract' }) =>
      api.portalAction(token, action),
  )
