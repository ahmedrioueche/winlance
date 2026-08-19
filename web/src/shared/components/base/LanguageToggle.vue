<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { setAppLocale } from '@/i18n'

const { locale } = useI18n()

function toggleLanguage() {
  const nextLocale = locale.value === 'fr' ? 'en' : 'fr'
  setAppLocale(nextLocale)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md border border-border bg-canvas-elevated px-2.5 py-1.5 text-xs font-semibold uppercase text-ink-soft shadow-soft transition hover:border-border-strong hover:text-ink cursor-pointer"
    :title="`Switch to ${locale === 'en' ? 'French' : 'English'}`"
    :aria-label="`Switch language. Current language is ${locale}`"
    @click="toggleLanguage"
  >
    <span class="text-accent font-bold text-xs" aria-hidden="true">🌐</span>
    <span>{{ locale }}</span>
  </button>
</template>
