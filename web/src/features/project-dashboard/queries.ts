import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { projectDashboardApi } from './api'
import type { Project, ProjectMilestone, ProjectRequirement, ProjectTask } from './types'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: MaybeRefOrGetter<string>) => ['projects', 'detail', toValue(id)] as const,
  tasks: (id: MaybeRefOrGetter<string>) => ['projects', 'tasks', toValue(id)] as const,
  tasksInfinite: (id: MaybeRefOrGetter<string>, pageSize: number) => ['projects', 'tasks', 'infinite', toValue(id), pageSize] as const,
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

export function useProjectTasksInfiniteQuery(id: MaybeRefOrGetter<string>, pageSize = 5) {
  return useInfiniteQuery({
    queryKey: computed(() => projectKeys.tasksInfinite(toValue(id), pageSize)),
    queryFn: ({ pageParam = 1 }) =>
      projectDashboardApi.fetchTasksPaginated(toValue(id), { page: pageParam, page_size: pageSize }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
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
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] })
    },
  })
}

type InfiniteDataShape = {
  pageParams: unknown[]
  pages: Array<{ count: number; next: string | null; previous: string | null; results: ProjectTask[] }>
}

function updateInfiniteTaskResults(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (tasks: ProjectTask[]) => ProjectTask[],
) {
  queryClient.setQueriesData<InfiniteDataShape>(
    { queryKey: ['projects', 'tasks'] },
    (oldData) => {
      if (!oldData || !Array.isArray(oldData.pages)) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: updater(page.results),
        })),
      }
    },
  )
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, payload }: { projectId: string; taskId: string; payload: Partial<ProjectTask> }) =>
      projectDashboardApi.updateTask(projectId, taskId, payload),
    onMutate: async ({ projectId, taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['projects', 'tasks'] })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      if (previousTasks) {
        queryClient.setQueryData<ProjectTask[]>(
          projectKeys.tasks(projectId),
          previousTasks.map((task) =>
            task.id === taskId ? { ...task, ...payload, updated_at: new Date().toISOString() } : task,
          ),
        )
      }

      updateInfiniteTaskResults(queryClient, (tasks) =>
        tasks.map((task) =>
          task.id === taskId ? { ...task, ...payload, updated_at: new Date().toISOString() } : task,
        ),
      )

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] })
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
      await queryClient.cancelQueries({ queryKey: ['projects', 'tasks'] })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      if (previousTasks) {
        queryClient.setQueryData<ProjectTask[]>(
          projectKeys.tasks(projectId),
          previousTasks.filter((t) => t.id !== taskId),
        )
      }

      updateInfiniteTaskResults(queryClient, (tasks) =>
        tasks.filter((t) => t.id !== taskId),
      )

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] })
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
      await queryClient.cancelQueries({ queryKey: ['projects', 'tasks'] })
      const previousTasks = queryClient.getQueryData<ProjectTask[]>(projectKeys.tasks(projectId))

      const orderedIds = Array.isArray(orders)
        ? orders.map((o) => (typeof o === 'string' ? o : o.id))
        : []

      if (previousTasks) {
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

      updateInfiniteTaskResults(queryClient, (tasks) => {
        const tasksById = new Map(tasks.map((t) => [t.id, t]))
        const newTasks: ProjectTask[] = []
        orderedIds.forEach((id, idx) => {
          const t = tasksById.get(id)
          if (t) {
            newTasks.push({ ...t, order: idx + 1 })
            tasksById.delete(id)
          }
        })
        tasksById.forEach((t) => newTasks.push(t))
        return newTasks
      })

      return { previousTasks }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectKeys.tasks(projectId), context.previousTasks)
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] })
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
