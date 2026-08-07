import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'

export const projectKeys = {
  all: ['projects'] as const,
  list: (p: api.ProjectListParams) => ['projects', 'list', p] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  links: (id: string) => ['projects', id, 'links'] as const,
  requirements: (id: string) => ['projects', id, 'requirements'] as const,
  milestones: (id: string) => ['projects', id, 'milestones'] as const,
  files: (id: string) => ['projects', id, 'files'] as const,
  reports: (id: string) => ['projects', id, 'reports'] as const,
}

export const useProjectsQuery = (p: MaybeRefOrGetter<api.ProjectListParams>) =>
  useQuery({
    queryKey: computed(() => projectKeys.list(toValue(p))),
    queryFn: () => api.fetchProjects(toValue(p)),
  })

export const useProjectQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.detail(toValue(id))),
    queryFn: () => api.fetchProject(toValue(id)),
  })

export const useShareLinksQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.links(toValue(id))),
    queryFn: () => api.fetchShareLinks(toValue(id)),
  })

export const useRequirementsQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.requirements(toValue(id))),
    queryFn: () => api.fetchRequirements(toValue(id)),
  })

export const useMilestonesQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.milestones(toValue(id))),
    queryFn: () => api.fetchMilestones(toValue(id)),
  })

export const useFilesQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.files(toValue(id))),
    queryFn: () => api.fetchFiles(toValue(id)),
  })

export const useReportsQuery = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.reports(toValue(id))),
    queryFn: () => api.fetchReports(toValue(id)),
  })

export function useCreateProjectMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useCreateProjectFromProposalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProjectFromProposal,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useCreateShareLinkMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createShareLink,
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.links(vars.id) })
      await qc.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useCreateFileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      name: string
      url?: string
      notes?: string
    }) => api.createFile(id, payload),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.files(vars.id) })
    },
  })
}

export function useCreateReportMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      title: string
      body: string
      is_visible_to_client?: boolean
    }) => api.createReport(id, payload),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.reports(vars.id) })
    },
  })
}
