import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type {
  Contract,
  ContractFromProposal,
  ContractTemplate,
  ContractUpdate,
} from './types'

export type ContractListParams = { page?: number; page_size?: number }

function asList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export async function fetchContracts(params: ContractListParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Contract>>('/contracts/', { params })
  return data
}

export async function fetchContract(id: string) {
  const { data } = await apiClient.get<Contract>(`/contracts/${id}/`)
  return data
}

export async function createContractFromProposal(payload: ContractFromProposal) {
  const { data } = await apiClient.post<Contract>('/contracts/from-proposal/', payload)
  return data
}

export async function updateContract(id: string, payload: ContractUpdate) {
  const { data } = await apiClient.patch<Contract>(`/contracts/${id}/`, payload)
  return data
}

export async function contractAction(
  id: string,
  action: 'generate' | 'export' | 'send' | 'sign',
) {
  const { data } = await apiClient.post<Contract>(`/contracts/${id}/${action}/`)
  return data
}

export async function fetchContractTemplates() {
  const { data } = await apiClient.get<ContractTemplate[] | PaginatedResponse<ContractTemplate>>(
    '/contract-templates/',
  )
  return asList(data)
}
