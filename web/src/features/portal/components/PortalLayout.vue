<script setup lang="ts">
import { ArrowLeft, FileText, FolderKanban, Lock, ScrollText, Sparkles } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { AppLogo, ErrorState, Skeleton, ThemeToggle } from '@/shared/components/base'

import PasscodeChallengeModal from './PasscodeChallengeModal.vue'
import { usePortalInfoQuery } from '../queries'

const { t } = useI18n()
const route = useRoute()
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
</script>

<template>
  <div class="bg-canvas text-ink flex min-h-screen flex-col font-sans">
    <!-- Top VIP Client Portal Header Bar -->
    <header
      class="border-border bg-canvas-elevated/90 shadow-soft sticky top-0 z-30 border-b backdrop-blur-md"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between gap-4">
          <!-- Left: Studio Logo & Back Button (Close Together) -->
          <div class="flex items-center gap-2.5 shrink-0 z-10">
            <AppLogo class="text-accent h-8 w-auto shrink-0" />

            <RouterLink
              v-if="route.name === 'portal-proposal-view'"
              :to="`/portal/${token}`"
              class="border-border bg-canvas text-ink hover:bg-canvas-muted flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowLeft class="text-accent h-3.5 w-3.5" />
              <span class="hidden sm:inline">{{ t('portal.nav.backToProposals', 'Back to Proposals') }}</span>
            </RouterLink>
          </div>

          <!-- Center: Company Name & Studio Branding (Centered) -->
          <div class="absolute left-1/2 z-0 max-w-[45%] -translate-x-1/2 text-center sm:max-w-[50%]">
            <h1 class="font-display text-ink truncate text-sm font-bold">
              {{ portalInfo?.company_name || portalInfo?.client_name || t('portal.nav.defaultClientPortal', 'Client Portal') }}
            </h1>
            <p class="text-muted truncate text-[11px]">
              {{
                portalInfo?.freelancer_name
                  ? `${portalInfo.freelancer_name} ${t('portal.nav.studio', 'Studio')}`
                  : t('portal.nav.defaultFreelancerPortal', 'Freelancer Portal')
              }}
            </p>
          </div>

          <!-- Right Controls: Lock Status, Theme Toggle -->
          <div class="flex items-center gap-2.5 shrink-0 z-10">
            <div
              v-if="isPasswordProtected"
              class="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 sm:flex dark:text-emerald-400"
            >
              <Lock class="h-3 w-3" />
              <span class="hidden md:inline">{{ t('portal.nav.passcodeProtected', 'Passcode Protected') }}</span>
            </div>

            <ThemeToggle />
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div
          v-if="!showChallengeModal && portalInfo"
          class="border-border/60 flex items-center gap-1 border-t pt-1 text-xs"
        >
          <RouterLink
            :to="`/portal/${token}`"
            class="flex items-center gap-2 border-b-2 px-3 py-2.5 font-semibold transition-colors"
            :class="
              route.name === 'portal-proposals' || route.name === 'portal-proposal-view'
                ? 'border-accent text-accent'
                : 'text-muted hover:text-ink border-transparent'
            "
          >
            <FileText class="h-4 w-4" />
            <span>{{ t('portal.nav.proposals', 'Proposals') }}</span>
          </RouterLink>

          <!-- Projects Tab -->
          <RouterLink
            :to="`/portal/${token}/projects`"
            class="flex items-center gap-2 border-b-2 px-3 py-2.5 font-semibold transition-colors"
            :class="
              route.name === 'portal-projects' || route.name === 'portal-project-detail'
                ? 'border-accent text-accent'
                : 'text-muted hover:text-ink border-transparent'
            "
          >
            <FolderKanban class="h-4 w-4" />
            <span>{{ t('portal.nav.projects', 'Projects') }}</span>
          </RouterLink>

          <div
            class="text-muted/60 flex cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-3 py-2.5 font-medium"
          >
            <ScrollText class="h-4 w-4" />
            <span>{{ t('portal.nav.contracts', 'Contracts') }}</span>
            <span
              class="bg-canvas-muted text-muted rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
              >{{ t('common.labels.soon', 'Soon') }}</span
            >
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
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

    <!-- Footer -->
    <footer class="border-border bg-canvas-elevated text-muted border-t py-6 text-center text-xs">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <Sparkles class="text-accent h-3.5 w-3.5" />
          <span>{{ t('common.footer.poweredBy', 'Powered by') }} <strong>Winlance</strong></span>
        </div>
        <p>© 2026 {{ portalInfo?.freelancer_name || 'Winlance' }}. {{ t('common.footer.rightsReserved', 'All rights reserved.') }}</p>
      </div>
    </footer>
  </div>
</template>
