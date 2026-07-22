import type { AuthTokens } from './types'

const TOKENS_KEY = 'wl.auth.tokens'
const MODE_KEY = 'wl.auth.persistMode'

export type PersistMode = 'session' | 'local'

function storageFor(mode: PersistMode): Storage {
  return mode === 'local' ? localStorage : sessionStorage
}

export function getPersistMode(): PersistMode {
  return localStorage.getItem(MODE_KEY) === 'local' ? 'local' : 'session'
}

export function loadTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY) ?? sessionStorage.getItem(TOKENS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<AuthTokens>
    if (typeof parsed.access === 'string' && typeof parsed.refresh === 'string') {
      return { access: parsed.access, refresh: parsed.refresh }
    }
  } catch {
    // ignore corrupt storage
  }
  clearTokens()
  return null
}

export function saveTokens(tokens: AuthTokens, mode: PersistMode = getPersistMode()) {
  clearTokens()
  localStorage.setItem(MODE_KEY, mode)
  storageFor(mode).setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function clearTokens() {
  localStorage.removeItem(TOKENS_KEY)
  sessionStorage.removeItem(TOKENS_KEY)
}
