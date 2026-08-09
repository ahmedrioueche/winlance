export type ClientStatus =
  | 'LEAD'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED'

export interface ClientProject {
  id: string
  title: string
  summary?: string
  status: string
  budget?: number | string | null
  due_date?: string | null
}

export interface ClientProposal {
  id: string
  title: string
  amount?: number | string | null
  status: string
  created_at?: string
}

export type Client = {
  id: string
  freelancer: number | string
  name: string
  email: string
  company_name: string
  status: ClientStatus | string
  phone?: string
  website?: string
  location?: string
  industry?: string
  start_date?: string | null
  notes: string
  portal_token?: string
  portal_passcode?: string
  is_portal_password_protected?: boolean
  projects?: ClientProject[]
  proposals?: ClientProposal[]
  created_at: string
  updated_at: string
}

export type CreateClientPayload = {
  name: string
  email?: string
  company_name?: string
  status?: string
  phone?: string
  website?: string
  location?: string
  industry?: string
  start_date?: string | null
  notes?: string
}
