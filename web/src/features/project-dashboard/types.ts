export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export interface ProjectRequirement {
  id: string
  project: string
  title: string
  description?: string
  order: number
  created_by_role: 'freelancer' | 'client'
  updated_by_role: 'freelancer' | 'client'
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  id: string
  project: string
  title: string
  description?: string
  status: MilestoneStatus
  due_date?: string | null
  progress_percent: number
  order: number
  created_at: string
  updated_at: string
}

export interface ProjectFileItem {
  id: string
  project: string
  name: string
  url: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectTask {
  id: string
  project: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  due_date?: string | null
  assignee?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  freelancer: string
  client?: string | null
  client_name?: string
  client_email?: string
  lead?: string | null
  proposal?: string | null
  contract?: string | null
  title: string
  summary?: string
  status: ProjectStatus
  start_date?: string | null
  due_date?: string | null
  budget?: number | string | null
  currency: string
  requirements?: ProjectRequirement[]
  milestones?: ProjectMilestone[]
  files?: ProjectFileItem[]
  tasks?: ProjectTask[]
  created_at: string
  updated_at: string
}
