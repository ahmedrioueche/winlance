import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type { Company, Contact, FollowUp, Lead, LeadStatus, Note } from './types'

export type LeadListParams = {
  page?: number
  page_size?: number
  q?: string
  status?: string
  ordering?: string
}

export async function fetchLeads(params: LeadListParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Lead>>('/leads/', { params })
  return data
}

export async function fetchLead(id: number | string) {
  const { data } = await apiClient.get<Lead>(`/leads/${id}/`)
  return data
}

export async function createLead(payload: {
  title: string
  description?: string
  status?: LeadStatus
  estimated_value?: string
  company?: number | null
}) {
  const { data } = await apiClient.post<Lead>('/leads/', payload)
  return data
}

export async function updateLead(id: number | string, payload: Partial<Lead>) {
  const { data } = await apiClient.patch<Lead>(`/leads/${id}/`, payload)
  return data
}

export async function deleteLead(id: number | string) {
  await apiClient.delete(`/leads/${id}/`)
}

export async function transitionLead(id: number | string, status: LeadStatus) {
  const { data } = await apiClient.post<Lead>(`/leads/${id}/transition/`, { status })
  return data
}

export async function rescoreLead(id: number | string) {
  const { data } = await apiClient.post<Lead>(`/leads/${id}/rescore/`)
  return data
}

export async function fetchPipeline() {
  const { data } = await apiClient.get<Record<string, Lead[]>>('/leads/pipeline/')
  return data
}

export async function fetchCompanies() {
  const { data } = await apiClient.get<PaginatedResponse<Company>>('/companies/')
  return data
}

export async function createCompany(payload: {
  name: string
  website?: string
  industry?: string
}) {
  const { data } = await apiClient.post<Company>('/companies/', payload)
  return data
}

export async function createContact(payload: {
  lead: number
  first_name: string
  last_name?: string
  email?: string
  phone?: string
}) {
  const { data } = await apiClient.post<Contact>('/contacts/', payload)
  return data
}

export async function createNote(payload: { lead: number; content: string }) {
  const { data } = await apiClient.post<Note>('/notes/', payload)
  return data
}

export async function createFollowUp(payload: {
  lead: number
  scheduled_at: string
  notes?: string
}) {
  const { data } = await apiClient.post<FollowUp>('/follow-ups/', payload)
  return data
}

export async function completeFollowUp(id: number | string, notes?: string) {
  const { data } = await apiClient.post<FollowUp>(`/follow-ups/${id}/complete/`, { notes })
  return data
}

export async function fetchFollowUps(params: {
  overdue?: boolean
  upcoming?: boolean
  completed?: boolean
  page?: number
} = {}) {
  const { data } = await apiClient.get<PaginatedResponse<FollowUp>>('/follow-ups/', { params })
  return data
}
