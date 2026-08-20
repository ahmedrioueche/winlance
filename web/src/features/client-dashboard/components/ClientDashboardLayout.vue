<script setup lang="ts">
import {
  ArrowLeft,
  FileSignature,
  FileText,
  Folder,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { AppLogo } from '@/shared/components/base'
import UserDropdown from '@/shared/components/navigation/UserDropdown.vue'
const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)
const clientId = computed(() => String(route.params.id || ''))

const navItems = computed(() => {
  const id = clientId.value
  const base = `/app/clients/${id}`
  return [
    { path: `${base}/overview`, labelKey: 'clients.nav.overview', defaultLabel: 'Overview', icon: LayoutDashboard },
    { path: `${base}/projects`, labelKey: 'clients.nav.projects', defaultLabel: 'Projects', icon: Folder },
    { path: `${base}/proposals`, labelKey: 'clients.nav.proposals', defaultLabel: 'Proposals', icon: FileText },
    { path: `${base}/contracts`, labelKey: 'clients.nav.contracts', defaultLabel: 'Contracts', icon: FileSignature },
    { path: `${base}/settings`, labelKey: 'clients.nav.settings', defaultLabel: 'Settings', icon: Settings },
  ]
})

function isLinkActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
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
        <AppLogo :to="`/app/clients/${clientId}/overview`" subtitle="Client Workspace" @click="closeMobileMenu" />

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
      <nav class="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Client Workspace Navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
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
        <span>Client Details</span>
        <span class="text-[10px] font-mono text-accent/80 font-medium">v0.1.0</span>
      </div>
    </aside>

    <!-- Main Right Content Viewport -->
    <div class="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Top Navbar Header -->
      <header class="flex h-16 items-center justify-between border-b border-border bg-canvas-elevated px-4 md:px-8 gap-3">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <button
            type="button"
            class="rounded-lg p-2 text-muted hover:bg-canvas-muted hover:text-ink md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu class="h-5 w-5" />
          </button>

          <!-- Back to All Clients Button -->
          <RouterLink
            to="/app/clients"
            class="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent/40 hover:bg-canvas-muted"
          >
            <ArrowLeft class="h-3.5 w-3.5 shrink-0 text-accent" />
            <span class="hidden sm:inline">Back to All Clients</span>
            <span class="sm:hidden">Clients</span>
          </RouterLink>
        </div>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-3 ms-auto">
          <UserDropdown />
        </div>
      </header>

      <!-- Router Content Viewport -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
