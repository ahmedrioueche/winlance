import { apiClient } from '@/shared/api/client'

import type { AuthTokens, AuthUser } from './types'

export async function registerRequest(payload: {
  username: string
  email: string
  password: string
}) {
  const { data } = await apiClient.post<{ message: string; user: AuthUser }>(
    '/auth/register/',
    payload,
  )
  return data
}

export async function loginRequest(payload: {
  email?: string
  username?: string
  password: string
}) {
  const { data } = await apiClient.post<AuthTokens>('/auth/login/', payload)
  return data
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<AuthUser>('/auth/me/')
  return data
}

export async function updateCurrentUser(payload: Partial<Pick<AuthUser, 'username' | 'first_name' | 'last_name'>>) {
  const { data } = await apiClient.patch<AuthUser>('/auth/me/', payload)
  return data
}

export async function refreshRequest(refresh: string) {
  const { data } = await apiClient.post<AuthTokens>('/auth/token/refresh/', { refresh })
  return data
}

export async function logoutRequest(refresh: string) {
  await apiClient.post('/auth/logout/', { refresh })
}

export async function verifyEmailRequest(token: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/verify-email/', { token })
  return data
}

export async function passwordResetRequest(email: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/password-reset/', { email })
  return data
}

export async function passwordResetConfirmRequest(token: string, password: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/password-reset/confirm/', {
    token,
    password,
  })
  return data
}

export async function socialLoginRequest(provider: 'google' | 'github', accessToken: string) {
  const { data } = await apiClient.post<AuthTokens>(`/auth/social/${provider}/`, {
    access_token: accessToken,
  })
  return data
}
