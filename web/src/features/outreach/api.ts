import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type {
  Checklist,
  ChecklistItem,
  OutreachSequence,
  OutreachTemplate,
  PlaybookSummary,
  RenderContext,
  Tag,
} from './types'

function asList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export async function fetchTags() {
  const { data } = await apiClient.get<Tag[] | PaginatedResponse<Tag>>('/outreach/tags/')
  return asList(data)
}

export async function createTag(payload: { name: string }) {
  const { data } = await apiClient.post<Tag>('/outreach/tags/', payload)
  return data
}

export async function updateTag(id: number, payload: { name: string }) {
  const { data } = await apiClient.patch<Tag>(`/outreach/tags/${id}/`, payload)
  return data
}

export async function deleteTag(id: number) {
  await apiClient.delete(`/outreach/tags/${id}/`)
}

export async function fetchTemplates(params: { q?: string; tag?: string; type?: string } = {}) {
  const { data } = await apiClient.get<OutreachTemplate[] | PaginatedResponse<OutreachTemplate>>(
    '/outreach/templates/',
    { params },
  )
  return asList(data)
}

export async function createTemplate(payload: {
  title: string
  content: string
  type?: string
  tag_names?: string[]
  is_playbook?: boolean
}) {
  const { data } = await apiClient.post<OutreachTemplate>('/outreach/templates/', payload)
  return data
}

export async function renderTemplate(id: number, context: RenderContext = {}) {
  const { data } = await apiClient.post<{
    title: string
    type: string
    rendered: string
  }>(`/outreach/templates/${id}/render/`, context)
  return data
}

export async function fetchSequences() {
  const { data } = await apiClient.get<OutreachSequence[] | PaginatedResponse<OutreachSequence>>(
    '/outreach/sequences/',
  )
  return asList(data)
}

export async function fetchChecklists() {
  const { data } = await apiClient.get<Checklist[] | PaginatedResponse<Checklist>>(
    '/outreach/checklists/',
  )
  return asList(data)
}

export async function createChecklist(payload: {
  title: string
  description?: string
  tag_names?: string[]
  is_playbook?: boolean
}) {
  const { data } = await apiClient.post<Checklist>('/outreach/checklists/', payload)
  return data
}

export async function addChecklistItem(
  checklistId: number,
  payload: { content: string; order?: number; is_done_default?: boolean },
) {
  const { data } = await apiClient.post<ChecklistItem>(
    `/outreach/checklists/${checklistId}/items/`,
    payload,
  )
  return data
}

export async function updateChecklistItem(
  id: number,
  payload: Partial<Pick<ChecklistItem, 'content' | 'order' | 'is_done_default'>>,
) {
  const { data } = await apiClient.patch<ChecklistItem>(`/outreach/checklist-items/${id}/`, payload)
  return data
}

export async function deleteChecklistItem(id: number) {
  await apiClient.delete(`/outreach/checklist-items/${id}/`)
}

export async function fetchPlaybook() {
  const { data } = await apiClient.get<PlaybookSummary>('/outreach/playbook/')
  return data
}
