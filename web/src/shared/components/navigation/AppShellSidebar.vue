<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { AppLogo } from '@/shared/components/base'
import type { SidebarLink } from '@/shared/components/navigation/useSidebarNav'
import { useSidebarNavContext } from '@/shared/components/navigation/useSidebarNav'

interface Props {
  links: SidebarLink[]
}

const props = defineProps<Props>()
const { t } = useI18n()
const route = useRoute()
const sidebarNav = useSidebarNavContext()

const asideClass = computed(() => {
  if (!sidebarNav.isMobile.value) {
    return 'translate-x-0'
  }
  return sidebarNav.sidebarOpen.value
    ? 'translate-x-0'
    : '-translate-x-full pointer-events-none'
})

function pathMatches(path: string, exact?: boolean) {
  return exact
    ? route.path === path
    : route.path === path || route.path.startsWith(`${path}/`)
}

function isActive(link: SidebarLink) {
  const [path, hash] = link.to.split('#')
  if (!pathMatches(path, link.exact)) return false

  // Prefer the longest matching path so /app/leads/follow-ups does not also activate /app/leads.
  if (!link.exact && !hash) {
    const hasMoreSpecificMatch = props.links.some((other) => {
      if (other.to === link.to) return false
      const [otherPath, otherHash] = other.to.split('#')
      if (otherHash || otherPath.length <= path.length) return false
      return pathMatches(otherPath, other.exact)
    })
    if (hasMoreSpecificMatch) return false
  }

  if (hash) return route.hash === `#${hash}`
  // Exact overview link: active when no section hash
  if (link.exact) return !route.hash || route.hash === '#'
  return true
}

function onNavigate() {
  sidebarNav.closeMobileSidebar()
}
</script>

<template>
  <aside
    class="fixed inset-y-0 start-0 z-40 flex h-full w-64 flex-col border-e border-border bg-canvas-elevated/95 shadow-soft backdrop-blur-md transition-transform duration-200 md:static md:z-20 md:translate-x-0"
    :class="asideClass"
    :aria-label="t('common.shell.sidebarLabel')"
  >
    <!-- Sidebar Header / Branding -->
    <div class="flex h-16 items-center px-5 border-b border-border/60">
      <AppLogo to="/app" @click="onNavigate" />
    </div>

    <!-- Navigation Links -->
    <nav class="flex flex-1 flex-col space-y-1 p-4 overflow-y-auto" :aria-label="t('common.shell.primaryNav')">
      <RouterLink
        v-for="link in props.links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
        :class="[
          isActive(link)
            ? 'bg-accent/15 text-accent font-semibold shadow-sm'
            : 'text-ink-soft hover:bg-canvas-muted hover:text-ink',
        ]"
        :aria-current="isActive(link) ? 'page' : undefined"
        @click="onNavigate"
      >
        <component :is="link.icon" v-if="link.icon" class="h-4 w-4 shrink-0" />
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
      <span>Main Workspace</span>
      <span class="text-[10px] font-mono text-accent/80 font-medium">v0.1.0</span>
    </div>
  </aside>
</template>
