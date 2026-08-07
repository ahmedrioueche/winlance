import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type {
  Milestone,
  Project,
  ProjectFile,
  ProjectReport,
  Requirement,
  ShareLink,
} from './types'

export type ProjectListParams = { page?: number; page_size?: number }

function asList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export const fetchProjects = async (params: ProjectListParams = {}) =>
  (await apiClient.get<PaginatedResponse<Project>>('/projects/', { params })).data

export const fetchProject = async (id: string) =>
  (await apiClient.get<Project>(`/projects/${id}/`)).data

export const createProject = async (payload: {
  title: string
  summary?: string
  client_name?: string
  client_email?: string
  status?: string
}) => (await apiClient.post<Project>('/projects/', payload)).data

export const createProjectFromProposal = async (payload: {
  proposal_id: string
  title?: string
  client_email?: string
  client_name?: string
  create_share_link?: boolean
}) => (await apiClient.post<Project>('/projects/from-proposal/', payload)).data

export const createShareLink = async ({ id, label }: { id: string; label?: string }) =>
  (await apiClient.post<ShareLink>(`/projects/${id}/share-links/`, { label })).data

export const fetchShareLinks = async (id: string) =>
  (await apiClient.get<ShareLink[]>(`/projects/${id}/share-links/list/`)).data

export const fetchRequirements = async (id: string) =>
  asList((await apiClient.get<Requirement[] | PaginatedResponse<Requirement>>(`/projects/${id}/requirements/`)).data)

export const fetchMilestones = async (id: string) =>
  asList((await apiClient.get<Milestone[] | PaginatedResponse<Milestone>>(`/projects/${id}/milestones/`)).data)

export const fetchFiles = async (id: string) =>
  asList((await apiClient.get<ProjectFile[] | PaginatedResponse<ProjectFile>>(`/projects/${id}/files/`)).data)

export const createFile = async (
  id: string,
  payload: { name: string; url?: string; notes?: string },
) => (await apiClient.post<ProjectFile>(`/projects/${id}/files/`, payload)).data

export const fetchReports = async (id: string) =>
  asList((await apiClient.get<ProjectReport[] | PaginatedResponse<ProjectReport>>(`/projects/${id}/reports/`)).data)

export const createReport = async (
  id: string,
  payload: { title: string; body: string; is_visible_to_client?: boolean },
) => (await apiClient.post<ProjectReport>(`/projects/${id}/reports/`, payload)).data
