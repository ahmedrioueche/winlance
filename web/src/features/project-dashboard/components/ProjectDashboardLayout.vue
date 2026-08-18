<script setup lang="ts">
import {
  ArrowLeft,
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { AppLogo } from '@/shared/components/base'
import ThemeToggle from '@/shared/components/base/ThemeToggle.vue'

import { useProjectQuery } from '../queries'

const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)

const projectId = computed(() => String(route.params.id || ''))
const { data: project } = useProjectQuery(projectId)

const backToProjectsUrl = computed(() => {
  // If a `from` query param is present, use it to navigate back to the originating workspace
  const from = route.query.from as string | undefined
  if (from && from.startsWith('/app/')) {
    return from
  }
  return '/app/projects'
})

const projectInitials = computed(() => {
  if (!project.value?.title) return 'PR'
  const parts = project.value.title.trim().split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return project.value.title.substring(0, 2).toUpperCase()
})

// Preserve the `from` query param across internal navigation so the back button stays correct
const fromQuery = computed(() => {
  const from = route.query.from as string | undefined
  return from ? { from } : {}
})

const navItems = computed(() => {
  const id = projectId.value
  const base = `/app/projects/${id}`
  const query = fromQuery.value
  return [
    { path: `${base}/overview`, to: { path: `${base}/overview`, query }, labelKey: 'common.projects.nav.overview', defaultLabel: 'Overview', icon: LayoutDashboard },
    { path: `${base}/tasks`, to: { path: `${base}/tasks`, query }, labelKey: 'common.projects.nav.tasks', defaultLabel: 'Tasks', icon: CheckSquare },
    { path: `${base}/milestones`, to: { path: `${base}/milestones`, query }, labelKey: 'common.projects.nav.milestones', defaultLabel: 'Milestones', icon: FolderKanban },
    { path: `${base}/settings`, to: { path: `${base}/settings`, query }, labelKey: 'common.projects.nav.settings', defaultLabel: 'Settings', icon: Settings },
  ]
})

function isLinkActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'border-accent/30 bg-accent-soft text-accent'
    case 'COMPLETED':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    case 'ON_HOLD':
      return 'border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'
    case 'CANCELLED':
      return 'border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400'
    default:
      return 'border-border bg-canvas-muted text-muted'
  }
}
</script>

<template>
  <div class="relative flex h-screen w-full overflow-hidden bg-canvas text-ink">
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
        <AppLogo :to="`/app/projects/${projectId}/overview`" subtitle="Project Workspace" @click="closeMobileMenu" />

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
          :key="item.path"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
          :class="[
            isLinkActive(item.path)
              ? 'bg-accent/15 text-accent font-semibold shadow-sm'
              : 'text-ink-soft hover:bg-canvas-muted hover:text-ink',
          ]"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ t(item.labelKey, item.defaultLabel) }}</span>
        </RouterLink>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
        <span>Project Controls</span>
        <ThemeToggle />
      </div>
    </aside>

    <!-- Main Right Content Viewport -->
    <div class="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Top Navbar Header -->
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
            <span class="hidden sm:inline">Back to All Projects</span>
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
          <!-- Notifications Alert Button -->
          <button
            type="button"
            class="relative rounded-lg border border-border bg-canvas p-2 text-muted hover:border-accent/40 hover:text-ink transition"
            aria-label="Notifications"
          >
            <Bell class="h-4 w-4" />
            <span class="absolute top-1 end-1 h-2 w-2 rounded-full bg-accent" />
          </button>

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
        <RouterView />
      </main>
    </div>
  </div>
</template>
