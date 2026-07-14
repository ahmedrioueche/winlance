<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/features/auth'
import { BaseButton, ThemeToggle } from '@/shared/components/base'
import {
  type ShellVariant,
  useSidebarNavContext,
} from '@/shared/components/navigation/useSidebarNav'

interface Props {
  variant: ShellVariant
}

defineProps<Props>()
const { t, te } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const sidebarNav = useSidebarNavContext()

const title = computed(() => {
  if (route.meta.titleKey && te(String(route.meta.titleKey))) {
    return t(String(route.meta.titleKey))
  }
  const name = typeof route.name === 'string' ? route.name : 'dashboard'
  const map: Record<string, string> = {
    dashboard: 'common.nav.dashboard',
    leads: 'common.nav.leads',
    'leads-pipeline': 'common.nav.leads',
    'lead-detail': 'common.nav.leads',
    'follow-ups': 'common.nav.followUps',
    companies: 'common.nav.companies',
    proposals: 'common.nav.proposals',
    'proposal-detail': 'common.nav.proposals',
    contracts: 'common.nav.contracts',
    'contract-detail': 'common.nav.contracts',
    projects: 'common.nav.projects',
    'project-detail': 'common.shell.projectTitle',
    outreach: 'common.nav.outreach',
    'ai-coach': 'common.nav.aiCoach',
    analytics: 'common.nav.analytics',
    profile: 'common.nav.profile',
  }
  return t(map[name] ?? 'common.nav.dashboard')
})

const userLabel = computed(() => auth.user?.username || auth.user?.email || '')
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-canvas-elevated/90 px-6 backdrop-blur-md md:px-8"
  >
    <BaseButton
      variant="ghost"
      size="sm"
      class="!px-2 md:hidden"
      :aria-label="t('common.shell.toggleSidebar')"
      :aria-expanded="sidebarNav.sidebarOpen"
      @click="sidebarNav.toggleSidebar()"
    >
      <span aria-hidden="true" class="text-lg leading-none">☰</span>
    </BaseButton>

    <div class="min-w-0 flex-1">
      <p class="truncate font-display text-base font-semibold text-ink md:text-lg">
        {{ title }}
      </p>
      <p v-if="variant === 'project'" class="truncate text-xs text-muted">
        {{ t('common.shell.projectSubtitle') }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <p v-if="userLabel" class="hidden text-sm text-muted sm:block">{{ userLabel }}</p>
      <ThemeToggle />
      <BaseButton variant="secondary" size="sm" @click="auth.logout()">
        {{ t('common.nav.logout') }}
      </BaseButton>
    </div>
  </header>
</template>
