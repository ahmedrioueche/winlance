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
