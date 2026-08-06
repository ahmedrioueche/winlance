import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useI18n } from 'vue-i18n'

export type ShellVariant = 'workspace' | 'project'

export type SidebarLink = {
  to: string
  label: string
  /** When true, active only on exact path match (ignoring query/hash). */
  exact?: boolean
}

export type SidebarNav = {
  sidebarOpen: Ref<boolean>
  isMobile: Ref<boolean>
  toggleSidebar: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const sidebarNavKey: InjectionKey<SidebarNav> = Symbol('sidebarNav')

const MOBILE_BREAKPOINT = 768

export function useSidebarNav(): SidebarNav {
  const sidebarOpen = ref(false)
  const isMobile = ref(false)

  function syncViewport() {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT
    isMobile.value = mobile
    sidebarOpen.value = !mobile
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function openMobileSidebar() {
    sidebarOpen.value = true
  }

  function closeMobileSidebar() {
    if (isMobile.value) sidebarOpen.value = false
  }

  onMounted(() => {
    syncViewport()
    window.addEventListener('resize', syncViewport)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', syncViewport)
  })

  return {
    sidebarOpen,
    isMobile,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
  }
}

export function useSidebarNavContext() {
  const nav = inject(sidebarNavKey)
  if (!nav) {
    throw new Error('useSidebarNavContext() requires AppLayout provide')
  }
  return nav
}

export function useSidebarLinks(
  variant: ShellVariant | Ref<ShellVariant> | ComputedRef<ShellVariant>,
  projectId?: Ref<string | number> | ComputedRef<string | number>,
) {
  const { t } = useI18n()

  return computed<SidebarLink[]>(() => {
    const mode = typeof variant === 'string' ? variant : variant.value

    if (mode === 'project') {
      const id = String(projectId?.value ?? '')
      if (!id || id === 'NaN' || id === 'undefined') {
        return [{ to: '/app/projects', label: t('common.nav.projects'), exact: true }]
      }
      const base = `/app/projects/${id}`
      return [
        { to: base, label: t('common.shell.projectOverview'), exact: true },
        { to: `${base}#share`, label: t('common.shell.projectShare') },
        { to: `${base}#requirements`, label: t('common.shell.projectRequirements') },
        { to: `${base}#milestones`, label: t('common.shell.projectMilestones') },
        { to: `${base}#files`, label: t('common.shell.projectFiles') },
        { to: `${base}#reports`, label: t('common.shell.projectReports') },
        { to: '/app/projects', label: t('common.shell.allProjects') },
      ]
    }

    return [
      { to: '/app', label: t('common.nav.dashboard'), exact: true },
      { to: '/app/projects', label: t('common.nav.projects') },
      { to: '/app/clients', label: t('common.nav.clients') },
      { to: '/app/analytics', label: t('common.nav.analytics') },
      { to: '/app/settings', label: t('common.nav.settings') },
    ]
  })
}
