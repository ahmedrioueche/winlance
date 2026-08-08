import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { projectDashboardApi } from './api'
import type { Project, ProjectMilestone, ProjectRequirement } from './types'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: MaybeRefOrGetter<string>) => ['projects', 'detail', toValue(id)] as const,
}

export function useProjectQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectDashboardApi.fetchProject(toValue(id)),
    enabled: () => Boolean(toValue(id)),
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) =>
      projectDashboardApi.updateProject(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}

export function useCreateRequirementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Partial<ProjectRequirement> }) =>
      projectDashboardApi.createRequirement(projectId, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useUpdateRequirementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, reqId, payload }: { projectId: string; reqId: string; payload: Partial<ProjectRequirement> }) =>
      projectDashboardApi.updateRequirement(projectId, reqId, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useCreateMilestoneMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Partial<ProjectMilestone> }) =>
      projectDashboardApi.createMilestone(projectId, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useUpdateMilestoneMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, milestoneId, payload }: { projectId: string; milestoneId: string; payload: Partial<ProjectMilestone> }) =>
      projectDashboardApi.updateMilestone(projectId, milestoneId, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}
