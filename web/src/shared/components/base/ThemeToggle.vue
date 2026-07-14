/**
 * Theme toggle — light / dark.
 * Driven by `useTheme()` + `[data-theme]` tokens.
 */
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useTheme } from '@/shared/composables/useTheme'

const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-md border border-border bg-canvas-elevated px-3 py-1.5 text-sm font-medium text-ink-soft shadow-soft transition hover:border-border-strong hover:text-ink"
    :aria-label="t('common.nav.toggleTheme')"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <span
      class="grid size-4 place-items-center rounded-full"
      :class="isDark ? 'bg-accent text-accent-foreground' : 'bg-canvas-muted text-ink'"
      aria-hidden="true"
    >
      <span class="text-[10px] leading-none">{{ isDark ? '☾' : '☀' }}</span>
    </span>
    <span>{{ isDark ? t('common.nav.themeDark') : t('common.nav.themeLight') }}</span>
  </button>
</template>
