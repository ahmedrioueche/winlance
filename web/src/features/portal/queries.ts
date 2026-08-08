import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { SuggestEditsPayload } from './types'

export const portalKeys = {
  all: ['portal'] as const,
  info: (token: string) => ['portal', 'info', token] as const,
  proposals: (token: string) => ['portal', 'proposals', token] as const,
  proposalDetail: (token: string, id: string) => ['portal', 'proposal', token, id] as const,
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
    mutationFn: ({ token, proposalId }: { token: string; proposalId: string }) =>
      api.acceptPortalProposal(token, proposalId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: portalKeys.all })
    },
  })
}
