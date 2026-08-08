import { apiClient } from '@/shared/api/client'

import type { Project, ProjectMilestone, ProjectRequirement } from './types'

export const projectDashboardApi = {
  /** Fetch single project details with nested requirements & milestones */
  async fetchProject(id: string): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${id}/`)
    return data
  },

  /** Update project core details */
  async updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/`, payload)
    return data
  },

  /** Create requirement/task for project */
  async createRequirement(projectId: string, payload: Partial<ProjectRequirement>): Promise<ProjectRequirement> {
    const { data } = await apiClient.post<ProjectRequirement>(`/projects/${projectId}/requirements/`, payload)
    return data
  },

  /** Update requirement */
  async updateRequirement(projectId: string, reqId: string, payload: Partial<ProjectRequirement>): Promise<ProjectRequirement> {
    const { data } = await apiClient.patch<ProjectRequirement>(`/projects/${projectId}/requirements/${reqId}/`, payload)
    return data
  },

  /** Create milestone */
  async createMilestone(projectId: string, payload: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const { data } = await apiClient.post<ProjectMilestone>(`/projects/${projectId}/milestones/`, payload)
    return data
  },

  /** Update milestone */
  async updateMilestone(projectId: string, milestoneId: string, payload: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const { data } = await apiClient.patch<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}/`, payload)
    return data
  },
}
