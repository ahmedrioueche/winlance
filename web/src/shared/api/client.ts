import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { appConfig } from '@/config'
import type { ApiError } from '@/shared/types/api'
import { logger } from '@/shared/utils/logger'

type TokenGetter = () => string | null
type RefreshHandler = () => Promise<string | null>
type UnauthorizedHandler = () => void

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let getAccessToken: TokenGetter = () => null
let refreshAccessToken: RefreshHandler = async () => null
let onUnauthorized: UnauthorizedHandler = () => undefined
let refreshPromise: Promise<string | null> | null = null

export function bindAuthInterceptors(options: {
  getAccessToken: TokenGetter
  refreshAccessToken: RefreshHandler
  onUnauthorized: UnauthorizedHandler
}) {
  getAccessToken = options.getAccessToken
  refreshAccessToken = options.refreshAccessToken
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
  async (error: AxiosError) => {
    const normalized = normalizeApiError(error)
    const original = error.config as RetriableConfig | undefined
    const url = original?.url ?? ''
    const isAuthEndpoint =
      url.includes('/auth/login/') ||
      url.includes('/auth/register/') ||
      url.includes('/auth/token/refresh/') ||
      url.includes('/auth/social/')

    if (normalized.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const access = await refreshPromise
        if (access) {
          original.headers.Authorization = `Bearer ${access}`
          return apiClient(original)
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError)
      }
      onUnauthorized()
    } else if (normalized.status === 401 && !isAuthEndpoint) {
      onUnauthorized()
    }

    logger.error('API request failed', normalized)
    return Promise.reject(normalized)
  },
)

function normalizeApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const raw = error.response?.data as
    | {
        error?: {
          code?: string
          message?: string
          status_code?: number
          details?: unknown
        }
        detail?: string
        [key: string]: unknown
      }
    | string
    | undefined

  if (typeof raw === 'string') {
    return {
      code: status ? `http_${status}` : 'network_error',
      message: raw || error.message || 'request_failed',
      status,
    }
  }

  const payload = raw?.error
  const message =
    (typeof payload?.message === 'string' && payload.message) ||
    (typeof raw?.detail === 'string' && raw.detail) ||
    error.message ||
    'request_failed'

  const details = payload?.details ?? (raw && !payload ? raw : undefined)

  return {
    code: payload?.code || (status ? `http_${status}` : 'network_error'),
    message,
    status: payload?.status_code || status,
    details,
  }
}
