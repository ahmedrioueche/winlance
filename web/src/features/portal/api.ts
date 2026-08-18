import { apiClient } from '@/shared/api/client'
import type { Contract } from '@/features/contracts/types'
import type { Proposal } from '@/features/proposals/types'

import type { PortalInfo, PortalProject, SuggestEditsPayload } from './types'

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

export async function acceptPortalProposal(
  token: string,
  proposalId: string,
  payload?: { signer_name?: string; signer_email?: string; selected_addon_ids?: string[] },
) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.post<Proposal>(
    `/portal/${token}/proposals/${proposalId}/accept/`,
    payload || {},
    { headers },
  )
  return data
}

export async function fetchPortalProjects(token: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<PortalProject[]>(`/portal/${token}/projects/`, {
    headers,
  })
  return data
}

export async function fetchPortalProject(token: string, projectId: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<PortalProject>(
    `/portal/${token}/projects/${projectId}/`,
    { headers },
  )
  return data
}

export async function approvePortalTask(
  token: string,
  projectId: string,
  taskId: string,
) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.patch<{ id: string; title: string; status: string; detail: string }>(
    `/portal/${token}/projects/${projectId}/tasks/${taskId}/approve/`,
    {},
    { headers },
  )
  return data
}

export async function approvePortalMilestone(
  token: string,
  projectId: string,
  milestoneId: string,
) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.post<{ id: string; title: string; status: string; detail: string }>(
    `/portal/${token}/projects/${projectId}/milestones/${milestoneId}/approve/`,
    {},
    { headers },
  )
  return data
}

export async function fetchPortalContracts(token: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<Contract[]>(`/portal/${token}/contracts/`, { headers })
  return data
}

export async function fetchPortalContract(token: string, contractId: string) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.get<Contract>(`/portal/${token}/contracts/${contractId}/`, {
    headers,
  })
  return data
}

export async function signPortalContract(
  token: string,
  contractId: string,
  payload?: { signer_name?: string; signer_email?: string },
) {
  const headers = getPasscodeHeader(token)
  const { data } = await apiClient.post<Contract>(
    `/portal/${token}/contracts/${contractId}/sign/`,
    payload || {},
    { headers },
  )
  return data
}

