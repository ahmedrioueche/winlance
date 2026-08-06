import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { bindAuthInterceptors } from '@/shared/api/client'
import { logger } from '@/shared/utils/logger'

import * as authApi from './api'
import {
  clearTokens,
  getPersistMode,
  loadTokens,
  saveTokens,
  type PersistMode,
} from './tokenStorage'
import type { AuthStatus, AuthTokens, AuthUser } from './types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const tokens = ref<AuthTokens | null>(null)
  const persistMode = ref<PersistMode>('session')

  let readyPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => status.value === 'authenticated' && !!tokens.value?.access)
  const isReady = computed(() => status.value !== 'idle' && status.value !== 'authenticating')

  function setTokens(next: AuthTokens) {
    tokens.value = next
    saveTokens(next, persistMode.value)
  }

  function setSession(
    nextUser: AuthUser,
    nextTokens: AuthTokens,
    mode: PersistMode = persistMode.value,
  ) {
    persistMode.value = mode
    user.value = nextUser
    tokens.value = nextTokens
    status.value = 'authenticated'
    saveTokens(nextTokens, mode)
  }

  function clearSession() {
    user.value = null
    tokens.value = null
    status.value = 'unauthenticated'
    clearTokens()
  }

  async function hydrateUser() {
    const nextUser = await authApi.fetchCurrentUser()
    user.value = nextUser
    status.value = 'authenticated'
    return nextUser
  }

  async function login(email: string, password: string, remember = false) {
    status.value = 'authenticating'
    const mode: PersistMode = remember ? 'local' : 'session'
    persistMode.value = mode
    try {
      const nextTokens = await authApi.loginRequest({ email, password })
      setTokens(nextTokens)
      const nextUser = await authApi.fetchCurrentUser()
      setSession(nextUser, nextTokens, mode)
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
      window.location.href = '/login'
    }
  }

  async function refreshAccessToken() {
    const refresh = tokens.value?.refresh
    if (!refresh) return null
    try {
      const next = await authApi.refreshRequest(refresh)
      setTokens({
        access: next.access,
        refresh: next.refresh || refresh,
      })
      return next.access
    } catch {
      clearSession()
      return null
    }
  }

  async function restoreSession() {
    const stored = loadTokens()
    if (!stored) {
      status.value = 'unauthenticated'
      return
    }

    persistMode.value = getPersistMode()
    tokens.value = stored
    status.value = 'authenticating'

    try {
      await hydrateUser()
    } catch {
      const access = await refreshAccessToken()
      if (!access) return
      try {
        await hydrateUser()
      } catch {
        clearSession()
      }
    }
  }

  function bootstrap() {
    bindAuthInterceptors({
      getAccessToken: () => tokens.value?.access ?? null,
      refreshAccessToken,
      onUnauthorized: () => clearSession(),
    })

    if (!readyPromise) {
      readyPromise = restoreSession()
    }
    return readyPromise
  }

  function whenReady() {
    return readyPromise ?? Promise.resolve()
  }

  async function socialLogin(provider: 'google' | 'github', accessToken: string, remember = false) {
    status.value = 'authenticating'
    const mode: PersistMode = remember ? 'local' : 'session'
    persistMode.value = mode
    try {
      const nextTokens = await authApi.socialLoginRequest(provider, accessToken)
      setTokens(nextTokens)
      const nextUser = await authApi.fetchCurrentUser()
      setSession(nextUser, nextTokens, mode)
    } catch (error) {
      clearSession()
      throw error
    }
  }

  return {
    user,
    status,
    tokens,
    isAuthenticated,
    isReady,
    login,
    socialLogin,
    register,
    logout,
    hydrateUser,
    refreshAccessToken,
    bootstrap,
    whenReady,
    clearSession,
    setSession,
    setTokens,
  }
})
