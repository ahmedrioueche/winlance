import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type { Project, ProjectMilestone, ProjectRequirement, ProjectTask } from './types'

export type TaskListParams = { page?: number; page_size?: number }

function asList<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as { results: T[] }).results)) {
    return (data as { results: T[] }).results
  }
  return []
}

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

  /** Fetch project tasks */
  async fetchTasks(projectId: string, params: TaskListParams = {}): Promise<ProjectTask[]> {
    const { data } = await apiClient.get<ProjectTask[] | { results: ProjectTask[] }>(`/projects/${projectId}/tasks/`, { params })
    return asList(data)
  },

  /** Fetch project tasks paginated */
  async fetchTasksPaginated(projectId: string, params: TaskListParams = {}): Promise<PaginatedResponse<ProjectTask>> {
    const { data } = await apiClient.get<PaginatedResponse<ProjectTask> | ProjectTask[]>(`/projects/${projectId}/tasks/`, { params })
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data }
    }
    return data
  },

  /** Create project task */
  async createTask(projectId: string, payload: Partial<ProjectTask>): Promise<ProjectTask> {
    const { data } = await apiClient.post<ProjectTask>(`/projects/${projectId}/tasks/`, payload)
    return data
  },

  /** Update project task */
  async updateTask(projectId: string, taskId: string, payload: Partial<ProjectTask>): Promise<ProjectTask> {
    const { data } = await apiClient.patch<ProjectTask>(`/projects/${projectId}/tasks/${taskId}/`, payload)
    return data
  },

  /** Delete project task */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}/`)
  },

  /** Reorder tasks */
  async reorderTasks(projectId: string, orders: Array<{ id: string; order: number }> | string[]): Promise<ProjectTask[]> {
    const { data } = await apiClient.post<ProjectTask[] | { results: ProjectTask[] }>(`/projects/${projectId}/tasks/reorder/`, { orders })
    return asList(data)
  },

  /** Delete project */
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}/`)
  },
}
