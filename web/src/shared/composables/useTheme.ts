import { computed, ref, watchEffect } from 'vue'

import { THEME_STORAGE_KEY, type ThemeMode } from '@/theme/tokens'

function readInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme')
    if (attr === 'light' || attr === 'dark') return attr
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

const theme = ref<ThemeMode>(readInitialTheme())

watchEffect(() => {
  applyTheme(theme.value)
})

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeMode) {
    theme.value = next
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
