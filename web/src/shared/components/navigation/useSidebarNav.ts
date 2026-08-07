import {
  ArrowLeft,
  BarChart2,
  BarChart3,
  ClipboardList,
  Files,
  Flag,
  Folder,
  LayoutDashboard,
  Settings,
  Share2,
  Users,
} from '@lucide/vue'
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
  icon?: unknown
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
        return [{ to: '/app/projects', label: t('common.nav.projects'), exact: true, icon: Folder }]
      }
      const base = `/app/projects/${id}`
      return [
        { to: base, label: t('common.shell.projectOverview'), exact: true, icon: LayoutDashboard },
        { to: `${base}#share`, label: t('common.shell.projectShare'), icon: Share2 },
        { to: `${base}#requirements`, label: t('common.shell.projectRequirements'), icon: ClipboardList },
        { to: `${base}#milestones`, label: t('common.shell.projectMilestones'), icon: Flag },
        { to: `${base}#files`, label: t('common.shell.projectFiles'), icon: Files },
        { to: `${base}#reports`, label: t('common.shell.projectReports'), icon: BarChart2 },
        { to: '/app/projects', label: t('common.shell.allProjects'), icon: ArrowLeft },
      ]
    }

    return [
      { to: '/app', label: t('common.nav.dashboard'), exact: true, icon: LayoutDashboard },
      { to: '/app/projects', label: t('common.nav.projects'), icon: Folder },
      { to: '/app/clients', label: t('common.nav.clients'), icon: Users },
      { to: '/app/analytics', label: t('common.nav.analytics'), icon: BarChart3 },
      { to: '/app/settings', label: t('common.nav.settings'), icon: Settings },
    ]
  })
}
