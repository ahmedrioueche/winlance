export type ContractStatus =
  | 'DRAFT'
  | 'GENERATING'
  | 'READY'
  | 'SENT'
  | 'SIGNED'
  | 'VOID'

export type ContractTemplate = {
  id: string
  name: string
  description: string
  body_template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Contract = {
  id: string
  proposal: string | null
  lead: number | null
  project_id: string | null
  template: string | null
  title: string
  body: string
  export_content: string
  amount: string | null
  currency: string
  status: ContractStatus | string
  generation_task_id: string
  export_task_id: string
  signed_at: string | null
  signed_name?: string
  signed_email?: string
  signed_ip?: string | null
  created_at: string
  updated_at: string
}

export type ContractFromProposal = {
  proposal_id: string
  title?: string
  template_id?: string
  generate?: boolean
}

export type ContractUpdate = Partial<
  Pick<Contract, 'title' | 'body' | 'amount' | 'currency' | 'project_id' | 'template' | 'proposal' | 'lead'>
>
