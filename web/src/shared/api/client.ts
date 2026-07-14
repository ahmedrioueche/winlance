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
  const data = error.response?.data as
    | { error?: { code?: string; message?: string; status_code?: number }; detail?: string }
    | undefined

  return {
    code: data?.error?.code || (status ? `http_${status}` : 'network_error'),
    message: data?.error?.message || data?.detail || error.message || 'request_failed',
    status: data?.error?.status_code || status,
    details: data,
  }
}
