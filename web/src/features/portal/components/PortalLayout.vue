<script setup lang="ts">
import {
  FileText,
  FolderKanban,
  Lock,
  Menu,
  ScrollText,
  Sparkles,
  X,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { AppLogo, ErrorState, Skeleton, ThemeToggle } from '@/shared/components/base'

import PasscodeChallengeModal from './PasscodeChallengeModal.vue'
import { usePortalInfoQuery } from '../queries'

const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)
const token = computed(() => String(route.params.token || ''))

const { data: portalInfo, isPending, isError, refetch } = usePortalInfoQuery(token)

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

const navItems = computed(() => {
  const tkn = token.value
  return [
    {
      name: 'proposals',
      path: `/portal/${tkn}`,
      label: t('portal.nav.proposals', 'Proposals'),
      icon: FileText,
      active: route.name === 'portal-proposals' || route.name === 'portal-proposal-view',
    },
    {
      name: 'projects',
      path: `/portal/${tkn}/projects`,
      label: t('portal.nav.projects', 'Projects'),
      icon: FolderKanban,
      active: route.name === 'portal-projects' || route.name === 'portal-project-detail',
    },
  ]
})
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
        <AppLogo :to="`/portal/${token}`" subtitle="VIP Client Portal" @click="closeMobileMenu" />

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
      <nav class="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Client Portal Navigation">
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
        </RouterLink>

        <!-- Disabled Contracts Nav Link -->
        <div
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted/50 cursor-not-allowed"
        >
          <ScrollText class="h-4 w-4 shrink-0" />
          <span>{{ t('portal.nav.contracts', 'Contracts') }}</span>
          <span class="ms-auto bg-canvas-muted text-muted rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
            {{ t('common.labels.soon', 'Soon') }}
          </span>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
        <div class="truncate">
          <p class="font-semibold text-ink truncate">
            {{ portalInfo?.company_name || portalInfo?.client_name || 'Client Portal' }}
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
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <button
            type="button"
            class="rounded-lg p-2 text-muted hover:bg-canvas-muted hover:text-ink md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu class="h-5 w-5" />
          </button>

          <!-- Header Title / Info -->
          <div>
            <h1 class="font-display text-sm font-bold text-ink">
              {{ portalInfo?.company_name || portalInfo?.client_name || t('portal.nav.defaultClientPortal', 'Client Portal') }}
            </h1>
            <p class="text-xs text-muted">
              {{ portalInfo?.freelancer_name ? `${portalInfo.freelancer_name} Studio` : '' }}
            </p>
          </div>
        </div>

        <!-- Right Header Actions: Passcode Lock Badge & Theme Toggle -->
        <div class="flex items-center gap-2.5 ms-auto">
          <div
            v-if="isPasswordProtected"
            class="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <Lock class="h-3 w-3" />
            <span class="hidden sm:inline">{{ t('portal.nav.passcodeProtected', 'Passcode Protected') }}</span>
          </div>

          <div class="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <!-- Router Content Viewport -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <!-- Loading State -->
        <div v-if="isPending" class="space-y-6">
          <Skeleton class="h-12 w-1/3 rounded-xl" />
          <Skeleton class="h-[500px] w-full rounded-2xl" />
        </div>

        <!-- Error State -->
        <ErrorState
          v-else-if="isError"
          class="mt-12"
          :title="t('portal.errors.notFoundTitle', 'Portal Not Found')"
          :message="t('portal.errors.notFoundMessage', 'This client portal link is invalid or has expired.')"
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

        <!-- Portal View Page Content -->
        <RouterView v-else />
      </main>
    </div>
  </div>
</template>
