<script setup lang="ts">
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  Files,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Lock,
  Menu,
  ScrollText,
  X,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { AppLogo, ErrorState, Skeleton, ThemeToggle } from '@/shared/components/base'

import PasscodeChallengeModal from './PasscodeChallengeModal.vue'
import { usePortalInfoQuery, usePortalProjectQuery } from '../queries'

const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: portalInfo, isPending: isInfoPending, isError: isInfoError } = usePortalInfoQuery(token)
const {
  data: project,
  isPending: isProjectPending,
  isError: isProjectError,
  refetch,
} = usePortalProjectQuery(token, projectId)

const backToProjectsUrl = computed(() => `/portal/${token.value}/projects`)

const isUnlocked = ref(false)
const isPasswordProtected = computed(() => portalInfo.value?.is_password_protected ?? false)
const showChallengeModal = computed(() => isPasswordProtected.value && !isUnlocked.value)

// Check if passcode is already stored in sessionStorage
watch(
  [portalInfo, token],
  () => {
    if (token.value) {
      const stored = sessionStorage.getItem(`winlance_portal_passcode_${token.value}`)
      if (stored || !isPasswordProtected.value) {
        isUnlocked.value = true
      }
    }
  },
  { immediate: true },
)

function handleUnlocked() {
  isUnlocked.value = true
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

const projectInitials = computed(() => {
  if (!project.value?.title) return 'PR'
  const parts = project.value.title.trim().split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return project.value.title.substring(0, 2).toUpperCase()
})

const navItems = computed(() => {
  const tkn = token.value
  const pId = projectId.value
  const base = `/portal/${tkn}/projects/${pId}`
  return [
    {
      name: 'overview',
      path: base,
      label: t('portal.projects.nav.overview', 'Overview'),
      icon: LayoutDashboard,
      active: route.name === 'portal-project-overview' || route.path === base,
    },
    {
      name: 'contract',
      path: `${base}/contract`,
      label: t('portal.projects.nav.contract', 'Contract'),
      icon: ScrollText,
      active: route.name === 'portal-project-contract' || route.path.includes('/contract'),
    },
    {
      name: 'tasks',
      path: `${base}/tasks`,
      label: t('portal.projects.nav.tasks', 'Tasks'),
      icon: CheckSquare,
      count: project.value?.tasks?.length,
      active: route.name === 'portal-project-tasks' || route.path.includes('/tasks'),
    },
    {
      name: 'milestones',
      path: `${base}/milestones`,
      label: t('portal.projects.nav.milestones', 'Milestones'),
      icon: FolderKanban,
      count: project.value?.milestones?.length,
      active: route.name === 'portal-project-milestones' || route.path.includes('/milestones'),
    },
    {
      name: 'files',
      path: `${base}/files`,
      label: t('portal.projects.nav.files', 'Shared Files'),
      icon: Files,
      count: project.value?.files?.length,
      active: route.name === 'portal-project-files' || route.path.includes('/files'),
    },
    {
      name: 'reports',
      path: `${base}/reports`,
      label: t('portal.projects.nav.reports', 'Status Reports'),
      icon: FileText,
      count: project.value?.reports?.length,
      active: route.name === 'portal-project-reports' || route.path.includes('/reports'),
    },
    {
      name: 'requirements',
      path: `${base}/requirements`,
      label: t('portal.projects.nav.requirements', 'Requirements'),
      icon: ListChecks,
      count: project.value?.requirements?.length,
      active: route.name === 'portal-project-requirements' || route.path.includes('/requirements'),
    },
  ]
})

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'border-accent/30 bg-accent-soft text-accent'
    case 'COMPLETED':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    case 'ON_HOLD':
      return 'border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'
    default:
      return 'border-border bg-canvas-muted text-muted'
  }
}
</script>

<template>
  <div class="relative flex h-screen w-full overflow-hidden bg-canvas text-ink font-sans">
    <!-- Blueprint background grid -->
    <div class="blueprint-grid pointer-events-none fixed inset-0 opacity-40" aria-hidden="true" />

    <!-- Mobile Navigation Drawer Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-overlay backdrop-blur-sm md:hidden"
      @click="closeMobileMenu"
    />

    <!-- Left Sidebar (Desktop + Mobile Drawer) -->
    <aside
      class="fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border bg-canvas-elevated shadow-soft transition-transform duration-200 md:static md:translate-x-0"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <!-- Sidebar Header / Branding -->
      <div class="flex h-16 items-center justify-between px-5 border-b border-border/60">
        <AppLogo :to="`/portal/${token}/projects`" subtitle="Project Workspace" @click="closeMobileMenu" />

        <!-- Close Mobile Drawer Button -->
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted hover:bg-canvas-muted hover:text-ink md:hidden ms-auto"
          @click="closeMobileMenu"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Project Workspace Navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
          :class="[
            item.active
              ? 'bg-accent/15 text-accent font-semibold shadow-sm'
              : 'text-ink-soft hover:bg-canvas-muted hover:text-ink',
          ]"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.label }}</span>
          <span
            v-if="item.count !== undefined"
            class="ms-auto rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-bold text-muted"
          >
            {{ item.count }}
          </span>
        </RouterLink>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
        <div class="truncate">
          <p class="font-semibold text-ink truncate max-w-[140px]">
            {{ project?.title || 'Project Workspace' }}
          </p>
          <p class="text-[11px] text-muted truncate">
            {{ portalInfo?.freelancer_name ? `${portalInfo.freelancer_name} Studio` : 'Winlance Portal' }}
          </p>
        </div>
        <ThemeToggle />
      </div>
    </aside>

    <!-- Main Right Content Viewport -->
    <div class="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Top Header Bar -->
      <header class="flex h-16 items-center justify-between border-b border-border bg-canvas-elevated px-4 md:px-8 gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Mobile Menu Toggle Button -->
          <button
            type="button"
            class="rounded-lg p-2 text-muted hover:bg-canvas-muted hover:text-ink md:hidden shrink-0"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu class="h-5 w-5" />
          </button>

          <!-- Back to All Projects Button -->
          <RouterLink
            :to="backToProjectsUrl"
            class="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent/40 hover:bg-canvas-muted shrink-0"
          >
            <ArrowLeft class="h-3.5 w-3.5 shrink-0 text-accent" />
            <span class="hidden sm:inline">{{ t('portal.projects.backToProjects', 'Back to Projects') }}</span>
            <span class="sm:hidden">Projects</span>
          </RouterLink>

          <!-- Project Title & Status Badge -->
          <div v-if="project" class="hidden md:flex items-center gap-2 min-w-0 ms-2">
            <h1 class="font-display text-sm font-bold text-ink truncate max-w-xs">
              {{ project.title }}
            </h1>
            <span
              class="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0"
              :class="getStatusBadgeClass(project.status)"
            >
              {{ project.status }}
            </span>
          </div>
        </div>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-3 ms-auto shrink-0">
          <div
            v-if="portalInfo?.is_password_protected"
            class="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <Lock class="h-3 w-3" />
            <span>{{ t('portal.nav.passcodeProtected', 'Passcode Protected') }}</span>
          </div>

          <!-- Project Workspace Avatar -->
          <div class="flex items-center gap-2.5 rounded-lg border border-border bg-canvas p-1.5 px-3">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              {{ projectInitials }}
            </div>
            <span class="hidden sm:inline text-xs font-semibold text-ink truncate max-w-[120px]">
              {{ project?.title || 'Project Workspace' }}
            </span>
          </div>
        </div>
      </header>

      <!-- Router Content Viewport -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <!-- Loading State -->
        <div v-if="isProjectPending || isInfoPending" class="space-y-6">
          <Skeleton class="h-12 w-1/3 rounded-xl" />
          <Skeleton class="h-[400px] w-full rounded-2xl" />
        </div>

        <!-- Error State -->
        <ErrorState
          v-else-if="isProjectError || isInfoError || !project"
          class="mt-12"
          :title="t('portal.projects.detailErrorTitle', 'Failed to load project details')"
          :message="t('portal.projects.detailErrorMessage', 'We could not load details for this project.')"
          :retry-label="t('common.actions.retry', 'Try again')"
          @retry="refetch()"
        />

        <!-- Passcode Challenge Lock Screen -->
        <PasscodeChallengeModal
          v-else-if="showChallengeModal && portalInfo"
          :token="token"
          :client-name="portalInfo.client_name"
          :company-name="portalInfo.company_name"
          :freelancer-name="portalInfo.freelancer_name"
          @unlocked="handleUnlocked"
        />

        <!-- Portal Project Page Content -->
        <RouterView v-else />
      </main>
    </div>
  </div>
</template>
