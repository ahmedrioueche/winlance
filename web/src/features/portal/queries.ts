import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { SuggestEditsPayload } from './types'

export const portalKeys = {
  all: ['portal'] as const,
  info: (token: string) => ['portal', 'info', token] as const,
  proposals: (token: string) => ['portal', 'proposals', token] as const,
  proposalDetail: (token: string, id: string) => ['portal', 'proposal', token, id] as const,
  projects: (token: string) => ['portal', 'projects', token] as const,
  projectDetail: (token: string, id: string) => ['portal', 'project', token, id] as const,
}

export function usePortalInfoQuery(token: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => portalKeys.info(toValue(token))),
    queryFn: () => api.fetchPortalInfo(toValue(token)),
    enabled: computed(() => Boolean(toValue(token))),
  })
}

export function usePortalProposalsQuery(token: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => portalKeys.proposals(toValue(token))),
    queryFn: () => api.fetchPortalProposals(toValue(token)),
    enabled: computed(() => Boolean(toValue(token))),
  })
}

export function usePortalProposalQuery(
  token: MaybeRefOrGetter<string>,
  proposalId: MaybeRefOrGetter<string>,
) {
  return useQuery({
    queryKey: computed(() => portalKeys.proposalDetail(toValue(token), toValue(proposalId))),
    queryFn: () => api.fetchPortalProposal(toValue(token), toValue(proposalId)),
    enabled: computed(() => Boolean(toValue(token) && toValue(proposalId))),
  })
}

export function usePortalProjectsQuery(token: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => portalKeys.projects(toValue(token))),
    queryFn: () => api.fetchPortalProjects(toValue(token)),
    enabled: computed(() => Boolean(toValue(token))),
  })
}

export function usePortalProjectQuery(
  token: MaybeRefOrGetter<string>,
  projectId: MaybeRefOrGetter<string>,
) {
  return useQuery({
    queryKey: computed(() => portalKeys.projectDetail(toValue(token), toValue(projectId))),
    queryFn: () => api.fetchPortalProject(toValue(token), toValue(projectId)),
    enabled: computed(() => Boolean(toValue(token) && toValue(projectId))),
  })
}

export function useVerifyPasscodeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ token, passcode }: { token: string; passcode: string }) =>
      api.verifyPortalPasscode(token, passcode),
    onSuccess: async (_, { token }) => {
      await qc.invalidateQueries({ queryKey: portalKeys.all })
      await qc.invalidateQueries({ queryKey: portalKeys.info(token) })
    },
  })
}

export function useSuggestPortalEditsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      token,
      proposalId,
      payload,
    }: {
      token: string
      proposalId: string
      payload: SuggestEditsPayload
    }) => api.suggestPortalEdits(token, proposalId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: portalKeys.all })
    },
  })
}

export function useAcceptPortalProposalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      token,
      proposalId,
      payload,
    }: {
      token: string
      proposalId: string
      payload?: { signer_name?: string; signer_email?: string; selected_addon_ids?: string[] }
    }) => api.acceptPortalProposal(token, proposalId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: portalKeys.all })
    },
  })
}

export function useApprovePortalTaskMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      token,
      projectId,
      taskId,
    }: {
      token: string
      projectId: string
      taskId: string
    }) => api.approvePortalTask(token, projectId, taskId),
    onSuccess: async (_, { token, projectId }) => {
      await qc.invalidateQueries({
        queryKey: portalKeys.projectDetail(token, projectId),
      })
    },
  })
}

export function useApprovePortalMilestoneMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      token,
      projectId,
      milestoneId,
    }: {
      token: string
      projectId: string
      milestoneId: string
    }) => api.approvePortalMilestone(token, projectId, milestoneId),
    onSuccess: async (_, { token, projectId }) => {
      await qc.invalidateQueries({
        queryKey: portalKeys.projectDetail(token, projectId),
      })
    },
  })
}

