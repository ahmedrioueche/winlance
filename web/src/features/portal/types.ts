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

export type SuggestEditsPayload = {
  title?: string
  body?: string
  amount?: number
  change_summary?: string
}

export type { Proposal }
