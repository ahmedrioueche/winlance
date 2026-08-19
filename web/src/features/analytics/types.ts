export type FunnelStage = {
  status: string
  label: string
  count: number
  value?: string
}

export type FunnelMetrics = {
  total_leads: number
  won_leads: number
  lost_leads: number
  open_leads: number
  win_rate: number
  pipeline_value: string
  won_value: string
  stages: FunnelStage[]
  conversions: Record<string, number>
  proposals: { total: number; accepted: number; sent: number }
  contracts: { total: number; signed: number }
  projects: { total: number; active: number; completed: number }
  generated_at: string
}

export type AnalyticsSummary = {
  kpis: {
    open_leads: number
    win_rate: number
    pipeline_value: string
    won_value: string
    active_projects: number
    proposals_sent: number
    contracts_signed: number
  }
  funnel: FunnelMetrics
  latest_snapshot_id?: string | null
  latest_snapshot_at?: string | null
}

export function maxStageCount(stages: FunnelStage[]): number {
  return Math.max(1, ...stages.map((stage) => stage.count))
}

export function stageWidths(stages: FunnelStage[]): Array<FunnelStage & { pct: number }> {
  const max = maxStageCount(stages)
  return stages.map((stage) => ({
    ...stage,
    pct: Math.round((stage.count / max) * 100),
  }))
}

export function formatCurrency(amount?: string | number): string {
  if (amount == null || amount === '') return '$0'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

