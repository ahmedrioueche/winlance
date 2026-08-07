export type Requirement = { id: string; title: string; description: string; order: number }
export type Milestone = {
  id: string
  title: string
  description: string
  status: string
  due_date: string | null
  progress_percent: number
}
export type ShareLink = {
  id: string
  token: string
  label: string
  is_active: boolean
  portal_path: string
}
export type ProjectFile = {
  id: string
  name: string
  url: string
  notes: string
}
export type ProjectReport = {
  id: string
  title: string
  body: string
  is_visible_to_client: boolean
}
export type Project = {
  id: string
  title: string
  summary: string
  status: string
  client_name: string
  client_email: string
  proposal: string | null
  contract: string | null
  start_date?: string | null
  due_date?: string | null
  budget?: string | number | null
  currency?: string
  requirements?: Requirement[]
  milestones?: Milestone[]
  reports?: ProjectReport[]
  files?: ProjectFile[]
  created_at?: string
  updated_at?: string
}
