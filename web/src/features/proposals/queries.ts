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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProposalFromLead,
    onSuccess: async (newProp) => {
      qc.setQueryData(proposalKeys.detail(newProp.id), newProp)
      await qc.invalidateQueries({ queryKey: proposalKeys.all })
    },
  })
}

export function useCreateProposalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Proposal>) => api.createProposal(payload),
    onSuccess: async (newProp) => {
      qc.setQueryData(proposalKeys.detail(newProp.id), newProp)
      await qc.invalidateQueries({ queryKey: proposalKeys.all })
      await qc.invalidateQueries({ queryKey: ['clients'] })
      await qc.invalidateQueries({ queryKey: ['client'] })
    },
  })
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

export function useSendProposalEmailMutation() {
  return useInvalidateMutation(
    ({ id, ...payload }: { id: string; recipients: string[]; custom_message?: string; portal_url?: string }) =>
      api.sendProposalEmail(id, payload),
  )
}

export function useUpdateProposalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & ProposalUpdate) => api.updateProposal(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: proposalKeys.all })
      await qc.invalidateQueries({ queryKey: ['clients'] })
      await qc.invalidateQueries({ queryKey: ['client'] })
    },
  })
}

export function useDeleteProposalMutation() {
  return useInvalidateMutation(api.deleteProposal)
}

export function useCreateProjectFromProposalMutation() {
  return useInvalidateMutation(api.createProjectFromProposal)
}

export function useSmartImportProposalMutation() {
  return useMutation({
    mutationFn: (raw_text: string) => api.smartImportProposal(raw_text),
  })
}

export function useGenerateProposalSectionMutation() {
  return useMutation({
    mutationFn: (payload: { section: 'summary' | 'terms'; title: string; milestones: any[] }) =>
      api.generateProposalSection(payload),
  })
}


