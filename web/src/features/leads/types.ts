export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'DISCOVERY_CALL'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'

export type Contact = {
  id: number
  lead: number
  first_name: string
  last_name: string
  email: string
  phone: string
  linkedin_url: string
}

export type Note = {
  id: number
  lead: number
  content: string
  created_at: string
}

export type FollowUp = {
  id: number
  lead: number
  scheduled_at: string
  completed: boolean
  notes: string
}

export type Company = {
  id: number
  name: string
  website: string
  industry: string
}

export type Lead = {
  id: number
  title: string
  description: string
  status: LeadStatus
  probability: number
  score: number
  estimated_value: string
  company: number | null
  contacts?: Contact[]
  notes?: Note[]
  follow_ups?: FollowUp[]
  created_at: string
  updated_at: string
}

export const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'DISCOVERY_CALL',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
]
