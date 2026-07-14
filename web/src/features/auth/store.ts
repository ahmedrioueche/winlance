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

  const isAuthenticated = computed(() => status.value === 'authenticated')

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

  async function login(email: string, password: string) {
    status.value = 'authenticating'
    try {
      const response = await authApi.loginRequest({ email, password })
      const nextTokens = { access: response.access, refresh: response.refresh }
      tokens.value = nextTokens
      const nextUser = response.user ?? (await authApi.fetchCurrentUser())
      setSession(nextUser, nextTokens)
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function logout() {
    try {
      if (tokens.value) {
        await authApi.logoutRequest()
      }
    } catch (error) {
      logger.warn('Logout request failed', error)
    } finally {
      clearSession()
    }
  }

  function bootstrap() {
    bindAuthInterceptors({
      getAccessToken: () => tokens.value?.access ?? null,
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
    logout,
    bootstrap,
    clearSession,
  }
})
