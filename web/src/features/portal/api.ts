import { apiClient } from '@/shared/api/client'
import type { Proposal } from '@/features/proposals/types'

import type { PortalInfo, SuggestEditsPayload } from './types'

function getPasscodeHeader(token: string) {
  const passcode = sessionStorage.getItem(`winlance_portal_passcode_${token}`) || ''
  return passcode ? { 'X-Portal-Passcode': passcode } : {}
}

export async function fetchPortalInfo(token: string) {
  const { data } = await apiClient.get<PortalInfo>(`/portal/${token}/info/`)
  return data
}

export async function verifyPortalPasscode(token: string, passcode: string) {
  const { data } = await apiClient.post<{ success: boolean }>(
    `/portal/${token}/verify-passcode/`,
    { passcode },
  )
  if (data.success) {
    sessionStorage.setItem(`winlance_portal_passcode_${token}`, passcode)
  }
  return data
}

export async function fetchPortalProposals(token: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<Proposal[]>(`/portal/${token}/proposals/`, { headers })
  return data
}

export async function fetchPortalProposal(token: string, proposalId: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<Proposal>(`/portal/${token}/proposals/${proposalId}/`, {
    headers,
  })
  return data
}

export async function suggestPortalEdits(
  token: string,
  proposalId: string,
  payload: SuggestEditsPayload,
) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.post<Proposal>(
    `/portal/${token}/proposals/${proposalId}/suggest-edits/`,
    payload,
    { headers },
  )
  return data
}

export async function acceptPortalProposal(token: string, proposalId: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.post<Proposal>(
    `/portal/${token}/proposals/${proposalId}/accept/`,
    {},
    { headers },
  )
  return data
}
