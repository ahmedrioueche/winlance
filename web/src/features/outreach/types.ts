export type Tag = {
  id: number
  user: number | null
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export type TemplateType = 'EMAIL' | 'LINKEDIN' | 'SCRIPT' | 'OTHER'

export type OutreachTemplate = {
  id: number
  user: number | null
  title: string
  content: string
  type: TemplateType
  tags: Tag[]
  is_playbook: boolean
  created_at: string
  updated_at: string
}

export type SequenceStep = {
  id: number
  sequence: number
  template: number
  template_detail?: OutreachTemplate
  step_number: number
  delay_days: number
  notes: string
}

export type OutreachSequence = {
  id: number
  user: number | null
  title: string
  description: string
  tags: Tag[]
  is_playbook: boolean
  steps: SequenceStep[]
  created_at: string
  updated_at: string
}

export type ChecklistItem = {
  id: number
  checklist: number
  content: string
  order: number
  is_done_default: boolean
  created_at: string
  updated_at: string
}

export type Checklist = {
  id: number
  user: number | null
  title: string
  description: string
  tags: Tag[]
  is_playbook: boolean
  items: ChecklistItem[]
  created_at: string
  updated_at: string
}

export type PlaybookSummary = {
  templates: number
  sequences: number
  checklists: number
  tags: number
  playbook_templates: number
  playbook_sequences: number
}

export type RenderContext = {
  client_name?: string
  company?: string
  title?: string
  freelancer_name?: string
}

export type OutreachInsertPayload = {
  title: string
  body: string
  source: 'template' | 'rendered' | 'coach'
  templateId?: number
}

export const TEMPLATE_TYPES: TemplateType[] = ['EMAIL', 'LINKEDIN', 'SCRIPT', 'OTHER']
