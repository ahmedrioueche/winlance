export type ProposalStatus =
  | 'DRAFT'
  | 'READY'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN'
  | 'GENERATING'

export type ProposalTemplate = {
  id: string
  name: string
  description: string
  body_template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type ProposalVersion = {
  id: string
  proposal: string
  version_number: number
  title: string
  body: string
  amount: string | number
  currency: string
  change_summary: string
  created_by_name: string
  created_by_role: 'freelancer' | 'client'
  created_at: string
}

export type Proposal = {
  id: string
  lead: number | null
  project_id: string | null
  template: string | null
  title: string
  target_project_name?: string
  summary: string
  body: string
  amount: string | number | null
  currency: string
  status: ProposalStatus | string
  generation_task_id: string
  versions?: ProposalVersion[]
  created_at: string
  updated_at: string
}

export type ProposalFromLead = {
  lead_id: number
  title?: string
  target_project_name?: string
  amount?: string
  currency?: string
  template_id?: string
  generate?: boolean
}

export type ProposalUpdate = Partial<
  Pick<Proposal, 'title' | 'target_project_name' | 'summary' | 'body' | 'amount' | 'currency' | 'project_id' | 'template' | 'status'>
>
