import { apiClient } from '@/shared/api/client'

import type { AnalyticsSummary, FunnelMetrics } from './types'

export async function fetchFunnel() {
  const { data } = await apiClient.get<FunnelMetrics>('/analytics/funnel/')
  return data
}

export async function fetchSummary() {
  const { data } = await apiClient.get<AnalyticsSummary>('/analytics/summary/')
  return data
}

export async function postSnapshot() {
  const { data } = await apiClient.post('/analytics/snapshots/')
  return data
}
