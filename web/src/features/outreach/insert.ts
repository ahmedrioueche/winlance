import type { OutreachInsertPayload } from './types'

const STORAGE_KEY = 'winlance.outreach.insert'

export function stashOutreachInsert(payload: OutreachInsertPayload) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function peekOutreachInsert(): OutreachInsertPayload | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OutreachInsertPayload
  } catch {
    return null
  }
}

export function consumeOutreachInsert(): OutreachInsertPayload | null {
  const payload = peekOutreachInsert()
  sessionStorage.removeItem(STORAGE_KEY)
  return payload
}

export function clearOutreachInsert() {
  sessionStorage.removeItem(STORAGE_KEY)
}
