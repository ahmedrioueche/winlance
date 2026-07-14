<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/features/auth'
import { BaseButton, ThemeToggle } from '@/shared/components/base'

const { t } = useI18n()
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-dvh">
    <header class="border-b border-border bg-canvas-elevated/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-page py-4">
        <RouterLink class="font-display text-xl text-ink" to="/">
          Winlance
        </RouterLink>
        <nav class="flex items-center gap-2" aria-label="Primary">
          <ThemeToggle />
          <BaseButton
            v-if="auth.isAuthenticated"
            variant="secondary"
            size="sm"
            @click="auth.logout()"
          >
            {{ t('common.nav.logout') }}
          </BaseButton>
          <RouterLink v-else to="/login">
            <BaseButton size="sm">{{ t('common.nav.login') }}</BaseButton>
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-page py-8">
      <slot />
    </main>
  </div>
</template>
