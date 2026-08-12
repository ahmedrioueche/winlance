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

export async function sendProposalEmail(id: string, payload: { recipients: string[]; custom_message?: string; portal_url?: string }) {
  const { data } = await apiClient.post<Proposal>(`/proposals/${id}/send-email/`, payload)
  return data
}

export async function fetchProposalTemplates() {
  const { data } = await apiClient.get<ProposalTemplate[] | PaginatedResponse<ProposalTemplate>>(
    '/proposal-templates/',
  )
  return asList(data)
}

export async function deleteProposal(id: string) {
  await apiClient.delete(`/proposals/${id}/`)
}

export async function createProjectFromProposal(id: string) {
  const { data } = await apiClient.post<{ project_id: string; title: string }>(`/proposals/${id}/create-project/`)
  return data
}

export async function smartImportProposal(raw_text: string) {
  const { data } = await apiClient.post<import('./types').SmartImportResult>('/proposals/smart-import/', { raw_text })
  return data
}

export async function generateProposalSection(payload: { section: 'summary' | 'terms'; title: string; milestones: any[] }) {
  const { data } = await apiClient.post<{ text: string }>('/proposals/generate-section/', payload)
  return data
}


