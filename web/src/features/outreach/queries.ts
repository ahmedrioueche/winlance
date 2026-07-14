import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import * as api from './api'
import type { RenderContext } from './types'

export const outreachKeys = {
  all: ['outreach'] as const,
  tags: ['outreach', 'tags'] as const,
  templates: (params: Record<string, unknown> = {}) =>
    ['outreach', 'templates', params] as const,
  sequences: ['outreach', 'sequences'] as const,
  checklists: ['outreach', 'checklists'] as const,
  playbook: ['outreach', 'playbook'] as const,
}

export const useTagsQuery = () =>
  useQuery({
    queryKey: outreachKeys.tags,
    queryFn: api.fetchTags,
  })

export const useTemplatesQuery = (params: MaybeRefOrGetter<Record<string, unknown>> = {}) =>
  useQuery({
    queryKey: computed(() => outreachKeys.templates(toValue(params))),
    queryFn: () => api.fetchTemplates(toValue(params)),
  })

export const useSequencesQuery = () =>
  useQuery({
    queryKey: outreachKeys.sequences,
    queryFn: api.fetchSequences,
  })

export const useChecklistsQuery = () =>
  useQuery({
    queryKey: outreachKeys.checklists,
    queryFn: api.fetchChecklists,
  })

export const usePlaybookQuery = () =>
  useQuery({
    queryKey: outreachKeys.playbook,
    queryFn: api.fetchPlaybook,
  })

export function useCreateTagMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createTag,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.all })
    },
  })
}

export function useUpdateTagMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.updateTag(id, { name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.all })
    },
  })
}

export function useDeleteTagMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteTag,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.all })
    },
  })
}

export function useCreateTemplateMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createTemplate,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.all })
    },
  })
}

export function useRenderTemplateMutation() {
  return useMutation({
    mutationFn: ({ id, context }: { id: number; context?: RenderContext }) =>
      api.renderTemplate(id, context ?? {}),
  })
}

export function useCreateChecklistMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createChecklist,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.checklists })
      await qc.invalidateQueries({ queryKey: outreachKeys.playbook })
    },
  })
}

export function useAddChecklistItemMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      checklistId,
      ...payload
    }: {
      checklistId: number
      content: string
      order?: number
      is_done_default?: boolean
    }) => api.addChecklistItem(checklistId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.checklists })
    },
  })
}

export function useUpdateChecklistItemMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number
      content?: string
      order?: number
      is_done_default?: boolean
    }) => api.updateChecklistItem(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.checklists })
    },
  })
}

export function useDeleteChecklistItemMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteChecklistItem,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: outreachKeys.checklists })
    },
  })
}
