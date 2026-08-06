<script setup lang="ts">
import { computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import AppShellSidebar from '@/shared/components/navigation/AppShellSidebar.vue'
import Navbar from '@/shared/components/navigation/Navbar.vue'
import {
  sidebarNavKey,
  useSidebarLinks,
  useSidebarNav,
  type ShellVariant,
} from '@/shared/components/navigation/useSidebarNav'

interface Props {
  variant?: ShellVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'workspace',
})

const { t } = useI18n()
const route = useRoute()
const sidebarNav = useSidebarNav()
provide(sidebarNavKey, sidebarNav)

const projectId = computed(() => String(route.params.id ?? ''))
const links = useSidebarLinks(
  computed(() => props.variant),
  projectId,
)

const showMobileOverlay = computed(
  () => sidebarNav.isMobile.value && sidebarNav.sidebarOpen.value,
)
</script>

<template>
  <div class="relative flex h-screen w-full overflow-hidden bg-canvas">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lift"
    >
      {{ t('common.a11y.skipToContent') }}
    </a>

    <div class="blueprint-grid pointer-events-none fixed inset-0 opacity-40" aria-hidden="true" />

    <AppShellSidebar :links="links" />

    <button
      v-if="showMobileOverlay"
      type="button"
      class="fixed inset-0 z-30 bg-overlay backdrop-blur-sm md:hidden"
      :aria-label="t('common.a11y.closeOverlay')"
      @click="sidebarNav.closeMobileSidebar()"
    />

    <div class="relative z-10 flex min-w-0 flex-1 flex-col">
      <Navbar :variant="variant" />

      <main
        id="main-content"
        tabindex="-1"
        class="flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
      >
        <div id="app-scroll" class="flex h-full w-full flex-col overflow-auto p-6 md:p-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
