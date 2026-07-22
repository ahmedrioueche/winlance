import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { ProposalUpdate } from './types'

export const proposalKeys = {
  all: ['proposals'] as const,
  list: (p: api.ProposalListParams) => ['proposals', 'list', p] as const,
  detail: (id: string) => ['proposals', 'detail', id] as const,
  templates: ['proposals', 'templates'] as const,
}

export function useProposalsQuery(params: MaybeRefOrGetter<api.ProposalListParams>) {
  return useQuery({
    queryKey: computed(() => proposalKeys.list(toValue(params))),
    queryFn: () => api.fetchProposals(toValue(params)),
  })
}

export function useProposalQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => proposalKeys.detail(toValue(id))),
    queryFn: () => api.fetchProposal(toValue(id)),
  })
}

export function useProposalTemplatesQuery() {
  return useQuery({
    queryKey: proposalKeys.templates,
    queryFn: api.fetchProposalTemplates,
  })
}

function useInvalidateMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: proposalKeys.all })
    },
  })
}

export function useCreateProposalMutation() {
  return useInvalidateMutation(api.createProposalFromLead)
}

export function useGenerateProposalMutation() {
  return useInvalidateMutation(api.generateProposal)
}

export function useCancelProposalGenerationMutation() {
  return useInvalidateMutation(api.cancelProposalGeneration)
}

export function useSendProposalMutation() {
  return useInvalidateMutation(api.sendProposal)
}

export function useUpdateProposalMutation() {
  return useInvalidateMutation(
    ({ id, ...payload }: { id: string } & ProposalUpdate) => api.updateProposal(id, payload),
  )
}
