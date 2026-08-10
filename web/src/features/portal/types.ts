import type { Proposal } from '@/features/proposals/types'

export type PortalInfo = {
  client_name: string
  company_name: string
  freelancer_name: string
  is_password_protected: boolean
  authenticated?: boolean
  project?: { title: string; summary?: string }
  projects?: Array<{ id: string; title: string; status: string }>
  requirements?: Array<{ id: string; title: string; description?: string }>
  offer?: { body: string }
  contract?: { body: string }
  progress?: { percent: number; milestones: Array<{ id: string; title: string; status: string; progress_percent: number }> }
  reports?: Array<{ id: string; title: string; body: string }>
  files?: Array<{ id: string; name: string; url?: string; notes?: string }>
}

export type PortalTask = {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string
  due_date?: string | null
  order?: number
  created_at?: string
}

export type PortalMilestone = {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | string
  due_date?: string | null
  progress_percent?: number
  order?: number
}

export type PortalRequirement = {
  id: string
  title: string
  description?: string
  order?: number
}

export type PortalProjectFile = {
  id: string
  name: string
  url?: string
  notes?: string
  created_at?: string
}

export type PortalProjectReport = {
  id: string
  title: string
  body: string
  created_at?: string
}

export type PortalProject = {
  id: string
  title: string
  summary?: string
  status: string
  start_date?: string | null
  due_date?: string | null
  budget?: number | string | null
  currency?: string
  created_at?: string
  progress_percent?: number
  milestones_count?: number
  done_milestones_count?: number
  tasks?: PortalTask[]
  milestones?: PortalMilestone[]
  requirements?: PortalRequirement[]
  files?: PortalProjectFile[]
  reports?: PortalProjectReport[]
}

export type SuggestEditsPayload = {
  title?: string
  body?: string
  amount?: number
  change_summary?: string
}

export type { Proposal }
