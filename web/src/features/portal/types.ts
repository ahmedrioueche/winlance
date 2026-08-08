import type { Proposal } from '@/features/proposals/types'

export type PortalInfo = {
  client_name: string
  company_name: string
  freelancer_name: string
  is_password_protected: boolean
}

export type SuggestEditsPayload = {
  title?: string
  body?: string
  amount?: number
  change_summary?: string
}

export type { Proposal }
