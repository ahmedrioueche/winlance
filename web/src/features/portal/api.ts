import { apiClient } from '@/shared/api/client'
import type { Requirement } from '@/features/projects/types'

export type PortalMilestone = {
  id: string
  title: string
  description: string
  status: string
  due_date: string | null
  progress_percent: number
  order: number
}

export type PortalDashboard = {
  project: {
    title: string
    summary: string
    status: string
    progress_percent?: number
  }
  requirements: Requirement[]
  offer?: { title: string; body: string; status: string } | null
  contract?: { title: string; body: string; status: string } | null
  progress?: {
    percent?: number
    milestones?: PortalMilestone[]
  }
  reports?: { id: string; title: string; body: string }[]
  files?: { id: string; name: string; url: string; notes: string }[]
}

export const fetchPortal = async (token: string) =>
  (await apiClient.get<PortalDashboard>(`/portal/${token}/`)).data

export const createRequirement = async ({
  token,
  ...payload
}: {
  token: string
  title: string
  description?: string
}) => (await apiClient.post<Requirement>(`/portal/${token}/requirements/`, payload)).data

export const updateRequirement = async ({
  token,
  id,
  ...payload
}: {
  token: string
  id: string
  title?: string
  description?: string
}) => (await apiClient.patch<Requirement>(`/portal/${token}/requirements/${id}/`, payload)).data

export const portalAction = async (
  token: string,
  action: 'accept-offer' | 'accept-contract',
) => (await apiClient.post(`/portal/${token}/${action}/`)).data
