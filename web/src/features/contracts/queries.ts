import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { ContractUpdate } from './types'

export const contractKeys = {
  all: ['contracts'] as const,
  list: (p: api.ContractListParams) => ['contracts', 'list', p] as const,
  detail: (id: string) => ['contracts', 'detail', id] as const,
  templates: ['contracts', 'templates'] as const,
}

export function useContractsQuery(params: MaybeRefOrGetter<api.ContractListParams>) {
  return useQuery({
    queryKey: computed(() => contractKeys.list(toValue(params))),
    queryFn: () => api.fetchContracts(toValue(params)),
  })
}

export function useContractQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => contractKeys.detail(toValue(id))),
    queryFn: () => api.fetchContract(toValue(id)),
  })
}

export function useContractTemplatesQuery() {
  return useQuery({
    queryKey: contractKeys.templates,
    queryFn: api.fetchContractTemplates,
  })
}

function useInvalidateMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}

export function useCreateContractMutation() {
  return useInvalidateMutation(api.createContractFromProposal)
}

export function useContractActionMutation() {
  return useInvalidateMutation(
    ({ id, action }: { id: string; action: 'generate' | 'export' | 'send' | 'sign' }) =>
      api.contractAction(id, action),
  )
}

export function useUpdateContractMutation() {
  return useInvalidateMutation(
    ({ id, ...payload }: { id: string } & ContractUpdate) => api.updateContract(id, payload),
  )
}
