import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { projectDashboardApi } from './api'
import type { Project, ProjectMilestone, ProjectRequirement, ProjectTask } from './types'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: MaybeRefOrGetter<string>) => ['projects', 'detail', toValue(id)] as const,
  tasks: (id: MaybeRefOrGetter<string>) => ['projects', 'tasks', toValue(id)] as const,
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

export function useProjectTasksQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: projectKeys.tasks(id),
    queryFn: () => projectDashboardApi.fetchTasks(toValue(id)),
    enabled: () => Boolean(toValue(id)),
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Partial<ProjectTask> }) =>
      projectDashboardApi.createTask(projectId, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) })
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, payload }: { projectId: string; taskId: string; payload: Partial<ProjectTask> }) =>
      projectDashboardApi.updateTask(projectId, taskId, payload),
    onMutate: async ({ projectId, taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.tasks(projectId) })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      if (previousTasks) {
        queryClient.setQueryData<ProjectTask[]>(
          projectKeys.tasks(projectId),
          previousTasks.map((task) =>
            task.id === taskId ? { ...task, ...payload, updated_at: new Date().toISOString() } : task,
          ),
        )
      }

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      projectDashboardApi.deleteTask(projectId, taskId),
    onMutate: async ({ projectId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.tasks(projectId) })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      if (previousTasks) {
        queryClient.setQueryData<ProjectTask[]>(
          projectKeys.tasks(projectId),
          previousTasks.filter((t) => t.id !== taskId),
        )
      }

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useReorderTasksMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, orders }: { projectId: string; orders: Array<{ id: string; order: number }> | string[] }) =>
      projectDashboardApi.reorderTasks(projectId, orders),
    onMutate: async ({ projectId, orders }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.tasks(projectId) })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      if (previousTasks) {
        const orderedIds = Array.isArray(orders)
          ? orders.map((o) => (typeof o === 'string' ? o : o.id))
          : []
        const tasksById = new Map(previousTasks.map((t) => [t.id, t]))
        const newTasks: ProjectTask[] = []

        orderedIds.forEach((id, idx) => {
          const t = tasksById.get(id)
          if (t) {
            newTasks.push({ ...t, order: idx + 1 })
            tasksById.delete(id)
          }
        })
        tasksById.forEach((t) => newTasks.push(t))

        queryClient.setQueryData(projectKeys.tasks(projectId), newTasks)
      }

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectDashboardApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
