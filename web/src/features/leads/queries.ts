import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import * as api from './api'
import type { LeadStatus } from './types'

export const leadKeys = {
  all: ['leads'] as const,
  list: (params: api.LeadListParams) => ['leads', 'list', params] as const,
  detail: (id: string | number) => ['leads', 'detail', String(id)] as const,
  pipeline: ['leads', 'pipeline'] as const,
  companies: ['leads', 'companies'] as const,
  followUps: (params: Record<string, unknown>) => ['leads', 'follow-ups', params] as const,
}

export function useLeadsQuery(params: MaybeRefOrGetter<api.LeadListParams>) {
  return useQuery({
    queryKey: computed(() => leadKeys.list(toValue(params))),
    queryFn: () => api.fetchLeads(toValue(params)),
  })
}

export function useLeadQuery(id: MaybeRefOrGetter<string | number>) {
  return useQuery({
    queryKey: computed(() => leadKeys.detail(toValue(id))),
    queryFn: () => api.fetchLead(toValue(id)),
  })
}

export function usePipelineQuery() {
  return useQuery({
    queryKey: leadKeys.pipeline,
    queryFn: api.fetchPipeline,
  })
}

export function useCreateLeadMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createLead,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: leadKeys.all })
    },
  })
}

export function useTransitionLeadMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: LeadStatus }) =>
      api.transitionLead(id, status),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: leadKeys.all })
      await qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) })
    },
  })
}

export function useDeleteLeadMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteLead,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: leadKeys.all })
    },
  })
}

export function useCompaniesQuery() {
  return useQuery({
    queryKey: leadKeys.companies,
    queryFn: api.fetchCompanies,
  })
}

export function useFollowUpsQuery(params: MaybeRefOrGetter<Record<string, unknown>>) {
  return useQuery({
    queryKey: computed(() => leadKeys.followUps(toValue(params))),
    queryFn: () => api.fetchFollowUps(toValue(params)),
  })
}

function invalidateLeadDetail(qc: ReturnType<typeof useQueryClient>, leadId?: number | string) {
  void qc.invalidateQueries({ queryKey: leadKeys.all })
  if (leadId != null) void qc.invalidateQueries({ queryKey: leadKeys.detail(leadId) })
}

export function useCreateContactMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: async (data) => invalidateLeadDetail(qc, data.lead),
  })
}

export function useCreateNoteMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createNote,
    onSuccess: async (data) => invalidateLeadDetail(qc, data.lead),
  })
}

export function useCreateFollowUpMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createFollowUp,
    onSuccess: async (data) => invalidateLeadDetail(qc, data.lead),
  })
}

export function useCompleteFollowUpMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: number | string; notes?: string }) =>
      api.completeFollowUp(id, notes),
    onSuccess: async (data) => {
      invalidateLeadDetail(qc, data.lead)
      await qc.invalidateQueries({ queryKey: ['leads', 'follow-ups'] })
    },
  })
}

export function useCreateCompanyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createCompany,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: leadKeys.companies })
    },
  })
}
