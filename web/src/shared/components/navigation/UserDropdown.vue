<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronDown, LogOut, Settings } from 'lucide-vue-next'

import { useAuthStore } from '@/features/auth'
import { LanguageToggle, ThemeToggle } from '@/shared/components/base'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const user = computed(() => auth.user)

const userInitial = computed(() => {
  if (user.value?.first_name) {
    return user.value.first_name[0].toUpperCase()
  }
  if (user.value?.username) {
    return user.value.username[0].toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email[0].toUpperCase()
  }
  return 'U'
})

const displayName = computed(() => {
  if (user.value?.first_name || user.value?.last_name) {
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
  }
  return user.value?.username || user.value?.email || 'User'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

async function handleLogout() {
  closeDropdown()
  await auth.logout()
  void router.push('/login')
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- User Avatar Trigger Button -->
    <button
      type="button"
      class="flex items-center gap-2 rounded-full p-1 text-sm font-medium transition-colors hover:bg-canvas-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggleDropdown"
    >
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-display text-xs font-bold text-accent shadow-xs transition-transform group-hover:scale-105"
      >
        {{ userInitial }}
      </div>

      <ChevronDown
        class="h-3.5 w-3.5 text-muted transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute end-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-border bg-canvas-elevated p-2 shadow-lg backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2"
      role="menu"
    >
      <!-- User Info Header -->
      <div class="rounded-xl border border-border/50 bg-canvas p-3">
        <div class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/20 font-display text-sm font-bold text-accent"
          >
            {{ userInitial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-display text-sm font-bold text-ink">
              {{ displayName }}
            </p>
            <p v-if="user?.email" class="truncate text-xs text-muted">
              {{ user.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions & Navigation -->
      <div class="space-y-0.5">
        <RouterLink
          to="/app/settings"
          class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-muted hover:text-ink"
          role="menuitem"
          @click="closeDropdown"
        >
          <Settings class="h-4 w-4 text-muted" />
          <span>{{ t('common.nav.settings', 'Settings') }}</span>
        </RouterLink>
      </div>

      <div class="border-t border-border/60 pt-2 space-y-1.5">
        <!-- Appearance Row -->
        <div class="flex items-center justify-between px-3 py-1 text-xs">
          <span class="font-medium text-muted">Appearance</span>
          <ThemeToggle />
        </div>

        <!-- Language Row -->
        <div class="flex items-center justify-between px-3 py-1 text-xs">
          <span class="font-medium text-muted">Language</span>
          <LanguageToggle />
        </div>

        <div class="border-t border-border/60 pt-1">
          <button
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
            role="menuitem"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            <span>{{ t('common.nav.logout', 'Log out') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
