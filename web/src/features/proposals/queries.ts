import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { Proposal, ProposalUpdate } from './types'

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
    enabled: computed(() => Boolean(toValue(id) && toValue(id) !== 'new')),
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

export function useCreateProposalFromLeadMutation() {
  return useInvalidateMutation(api.createProposalFromLead)
}

export function useCreateProposalMutation() {
  return useInvalidateMutation((payload: Partial<Proposal>) => api.createProposal(payload))
}

export function useCreateProposalVersionMutation() {
  return useInvalidateMutation(
    ({ id, ...payload }: { id: string; title?: string; body?: string; amount?: number; change_summary?: string; created_by_role?: string }) =>
      api.createProposalVersion(id, payload),
  )
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

export function useDeleteProposalMutation() {
  return useInvalidateMutation(api.deleteProposal)
}

export function useCreateProjectFromProposalMutation() {
  return useInvalidateMutation(api.createProjectFromProposal)
}
