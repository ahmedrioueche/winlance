import { apiClient } from '@/shared/api/client'

import type { AuthTokens, AuthUser } from './types'

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  access: string
  refresh: string
  user?: AuthUser
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login/', payload)
  return data
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me/')
  return data
}

export async function refreshRequest(refresh: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/token/refresh/', { refresh })
  return data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout/')
}
