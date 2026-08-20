import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types/pagination'

import type { Client, CreateClientPayload } from './types'

export type ClientListParams = { page?: number; page_size?: number }

export const fetchClients = async (params: ClientListParams = {}) =>
  (await apiClient.get<PaginatedResponse<Client>>('/clients/', { params })).data

export const fetchClient = async (id: string) =>
  (await apiClient.get<Client>(`/clients/${id}/`)).data

export const createClient = async (payload: CreateClientPayload) =>
  (await apiClient.post<Client>('/clients/', payload)).data

export const updateClient = async ({ id, ...payload }: Partial<Client> & { id: string }) =>
  (await apiClient.patch<Client>(`/clients/${id}/`, payload)).data

export const deleteClient = async (id: string) =>
  (await apiClient.delete(`/clients/${id}/`)).data

export const fetchClientOverview = async (id: string) =>
  (await apiClient.get<{ client: Client; stats: Record<string, number>; recent_projects: unknown[] }>(`/clients/${id}/overview/`)).data

