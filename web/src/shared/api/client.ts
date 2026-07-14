import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { appConfig } from '@/config'
import type { ApiError } from '@/shared/types/api'
import { logger } from '@/shared/utils/logger'

type TokenGetter = () => string | null
type UnauthorizedHandler = () => void

let getAccessToken: TokenGetter = () => null
let onUnauthorized: UnauthorizedHandler = () => undefined

export function bindAuthInterceptors(options: {
  getAccessToken: TokenGetter
  onUnauthorized: UnauthorizedHandler
}) {
  getAccessToken = options.getAccessToken
  onUnauthorized = options.onUnauthorized
}

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalized = normalizeApiError(error)
    logger.error('API request failed', normalized)
    if (normalized.status === 401) {
      onUnauthorized()
    }
    return Promise.reject(normalized)
  },
)

function normalizeApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as
    | { error?: { code?: string; message?: string }; detail?: string }
    | undefined

  return {
    code: data?.error?.code || (status ? `http_${status}` : 'network_error'),
    // Technical / backend text is for logs only — UI must use translated generics.
    message: data?.error?.message || data?.detail || error.message || 'request_failed',
    status,
    details: data,
  }
}
