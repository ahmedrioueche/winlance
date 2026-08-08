import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type {
  Proposal,
  ProposalFromLead,
  ProposalTemplate,
  ProposalUpdate,
} from './types'

export type ProposalListParams = { page?: number; page_size?: number }

function asList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export async function fetchProposals(params: ProposalListParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Proposal>>('/proposals/', { params })
  return data
}

export async function fetchProposal(id: string) {
  const { data } = await apiClient.get<Proposal>(`/proposals/${id}/`)
  return data
}

export async function createProposal(payload: Partial<Proposal>) {
  const { data } = await apiClient.post<Proposal>('/proposals/', payload)
  return data
}

export async function createProposalVersion(id: string, payload: { title?: string; body?: string; amount?: number; change_summary?: string; created_by_role?: string }) {
  const { data } = await apiClient.post<Proposal>(`/proposals/${id}/create-version/`, payload)
  return data
}

export async function createProposalFromLead(payload: ProposalFromLead) {
  const { data } = await apiClient.post<Proposal>('/proposals/from-lead/', payload)
  return data
}

export async function updateProposal(id: string, payload: ProposalUpdate) {
  const { data } = await apiClient.patch<Proposal>(`/proposals/${id}/`, payload)
  return data
}

export async function generateProposal(id: string) {
  const { data } = await apiClient.post<Proposal>(`/proposals/${id}/generate/`)
  return data
}

export async function cancelProposalGeneration(id: string) {
  const { data } = await apiClient.post<Proposal>(`/proposals/${id}/cancel-generation/`)
  return data
}

export async function sendProposal(id: string) {
  const { data } = await apiClient.post<Proposal>(`/proposals/${id}/send/`)
  return data
}

export async function fetchProposalTemplates() {
  const { data } = await apiClient.get<ProposalTemplate[] | PaginatedResponse<ProposalTemplate>>(
    '/proposal-templates/',
  )
  return asList(data)
}
