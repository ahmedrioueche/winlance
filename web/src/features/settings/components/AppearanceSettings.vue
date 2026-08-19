<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { setAppLocale } from '@/i18n'
import { BaseButton, BaseCheckbox, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { useToast } from '@/shared/toast/useToast'

const { t, locale } = useI18n()
const toast = useToast()

const selectedTheme = ref('dark')
const compactMode = ref(false)
const selectedLocale = ref(locale.value || 'en')
const isSaving = ref(false)

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English (US)' },
  { value: 'fr', label: 'Français (French)' },
]

function setTheme(theme: string) {
  selectedTheme.value = theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  }
  toast.success(`Theme set to ${theme}.`)
}

async function handleSave() {
  isSaving.value = true
  try {
    if (selectedLocale.value === 'en' || selectedLocale.value === 'fr') {
      setAppLocale(selectedLocale.value)
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
    toast.success(t('settings.savedSuccess', 'Settings updated successfully.'))
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.appearance.title', 'Appearance & Preferences') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.appearance.subtitle', 'Customize your theme, language, and interface layout') }}
      </p>
    </div>

    <!-- Theme Selector Cards -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-ink">
        {{ t('settings.appearance.themeTitle', 'Color Theme') }}
      </h3>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <!-- Dark Card -->
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition focus:outline-none"
          :class="selectedTheme === 'dark' ? 'border-accent bg-accent-soft/40 text-ink ring-2 ring-accent/30' : 'border-border bg-canvas text-muted hover:border-accent/40'"
          @click="setTheme('dark')"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-amber-400 border border-zinc-700">
            <Moon class="h-5 w-5" />
          </div>
          <span class="text-xs font-semibold">
            {{ t('settings.appearance.darkTheme', 'Dark Mode') }}
          </span>
        </button>

        <!-- Light Card -->
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition focus:outline-none"
          :class="selectedTheme === 'light' ? 'border-accent bg-accent-soft/40 text-ink ring-2 ring-accent/30' : 'border-border bg-canvas text-muted hover:border-accent/40'"
          @click="setTheme('light')"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
            <Sun class="h-5 w-5" />
          </div>
          <span class="text-xs font-semibold">
            {{ t('settings.appearance.lightTheme', 'Light Mode') }}
          </span>
        </button>

        <!-- System Card -->
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition focus:outline-none"
          :class="selectedTheme === 'system' ? 'border-accent bg-accent-soft/40 text-ink ring-2 ring-accent/30' : 'border-border bg-canvas text-muted hover:border-accent/40'"
          @click="setTheme('system')"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-muted text-ink-soft border border-border">
            <Monitor class="h-5 w-5" />
          </div>
          <span class="text-xs font-semibold">
            {{ t('settings.appearance.systemTheme', 'System Default') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Language & Layout -->
    <form class="space-y-4 pt-2" @submit.prevent="handleSave">
      <BaseSelect
        v-model="selectedLocale"
        :label="t('settings.appearance.language', 'Language')"
        :options="languageOptions"
      />

      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div>
          <h4 class="text-sm font-semibold text-ink">
            {{ t('settings.appearance.compactView', 'Compact Mode') }}
          </h4>
          <p class="text-xs text-muted">Use denser paddings and rows across lists and dashboards</p>
        </div>
        <BaseCheckbox v-model="compactMode" />
      </div>

      <div class="flex justify-end pt-2">
        <BaseButton :loading="isSaving" type="submit">
          Save Appearance
        </BaseButton>
      </div>
    </form>
  </div>
</template>
