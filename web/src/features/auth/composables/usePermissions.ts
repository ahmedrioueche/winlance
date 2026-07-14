import { computed } from 'vue'

import type { Permission } from '@/shared/permissions'

import { useAuthStore } from '../store'

/** Placeholder RBAC until backend exposes permission claims. */
export function usePermissions() {
  const auth = useAuthStore()

  const granted = computed(() => {
    if (!auth.isAuthenticated) return new Set<Permission>()
    return new Set<Permission>([
      'lead:read',
      'lead:write',
      'project:read',
      'project:write',
      'project:delete',
    ])
  })

  function can(permission: Permission) {
    return granted.value.has(permission)
  }

  function hasRole(_role: string) {
    return auth.isAuthenticated
  }

  return { can, hasRole }
}
