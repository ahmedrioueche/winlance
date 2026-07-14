export type ProposalStatus =
  | 'DRAFT'
  | 'GENERATING'
  | 'READY'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'

export type ProposalTemplate = {
  id: string
  name: string
  description: string
  body_template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Proposal = {
  id: string
  lead: number | null
  project_id: string | null
  template: string | null
  title: string
  summary: string
  body: string
  amount: string | null
  currency: string
  status: ProposalStatus | string
  generation_task_id: string
  created_at: string
  updated_at: string
}

export type ProposalFromLead = {
  lead_id: number
  title?: string
  amount?: string
  currency?: string
  template_id?: string
  generate?: boolean
}

export type ProposalUpdate = Partial<
  Pick<Proposal, 'title' | 'summary' | 'body' | 'amount' | 'currency' | 'project_id' | 'template'>
>
