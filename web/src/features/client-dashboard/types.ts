export type ClientStatus =
  | 'LEAD'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED'

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
