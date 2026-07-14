import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { bindAuthInterceptors } from '@/shared/api/client'
import { logger } from '@/shared/utils/logger'

import * as authApi from './api'
import type { AuthStatus, AuthTokens, AuthUser } from './types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const tokens = ref<AuthTokens | null>(null)

  const isAuthenticated = computed(() => status.value === 'authenticated' && !!tokens.value?.access)

  function setTokens(next: AuthTokens) {
    tokens.value = next
  }

  function setSession(nextUser: AuthUser, nextTokens: AuthTokens) {
    user.value = nextUser
    tokens.value = nextTokens
    status.value = 'authenticated'
  }

  function clearSession() {
    user.value = null
    tokens.value = null
    status.value = 'unauthenticated'
  }

  async function hydrateUser() {
    const nextUser = await authApi.fetchCurrentUser()
    user.value = nextUser
    status.value = 'authenticated'
    return nextUser
  }

  async function login(email: string, password: string) {
    status.value = 'authenticating'
    try {
      const nextTokens = await authApi.loginRequest({ email, password })
      setTokens(nextTokens)
      const nextUser = await authApi.fetchCurrentUser()
      setSession(nextUser, nextTokens)
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function register(username: string, email: string, password: string) {
    return authApi.registerRequest({ username, email, password })
  }

  async function logout() {
    try {
      if (tokens.value?.refresh) {
        await authApi.logoutRequest(tokens.value.refresh)
      }
    } catch (error) {
      logger.warn('Logout request failed', error)
    } finally {
      clearSession()
    }
  }

  async function refreshAccessToken() {
    const refresh = tokens.value?.refresh
    if (!refresh) return null
    try {
      const next = await authApi.refreshRequest(refresh)
      setTokens(next)
      return next.access
    } catch {
      clearSession()
      return null
    }
  }

  function bootstrap() {
    bindAuthInterceptors({
      getAccessToken: () => tokens.value?.access ?? null,
      refreshAccessToken,
      onUnauthorized: () => clearSession(),
    })
    if (!tokens.value) {
      status.value = 'unauthenticated'
    }
  }

  return {
    user,
    status,
    tokens,
    isAuthenticated,
    login,
    register,
    logout,
    hydrateUser,
    refreshAccessToken,
    bootstrap,
    clearSession,
    setSession,
    setTokens,
  }
})
