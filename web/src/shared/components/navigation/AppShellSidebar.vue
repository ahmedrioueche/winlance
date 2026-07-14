<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

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

function isActive(link: SidebarLink) {
  const [path, hash] = link.to.split('#')
  const pathMatches = link.exact
    ? route.path === path
    : route.path === path || route.path.startsWith(`${path}/`)

  if (!pathMatches) return false
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
    <div class="flex h-14 items-center gap-2 border-b border-border px-4">
      <RouterLink
        class="font-display text-lg font-semibold tracking-tight text-ink"
        to="/app"
        @click="onNavigate"
      >
        Winlance
      </RouterLink>
    </div>

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-3" :aria-label="t('common.shell.primaryNav')">
      <RouterLink
        v-for="link in props.links"
        :key="link.to"
        :to="link.to"
        class="rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-canvas-muted hover:text-ink"
        :class="isActive(link) && 'bg-accent-soft text-ink'"
        :aria-current="isActive(link) ? 'page' : undefined"
        @click="onNavigate"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
