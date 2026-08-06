<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { appConfig } from '@/config'
import { BaseButton, ThemeToggle } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <main class="px-page relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center py-16">
    <div class="end-page absolute top-6">
      <ThemeToggle />
    </div>
    <p class="text-muted text-sm font-medium tracking-[0.2em] uppercase">
      {{ appConfig.appName }}
    </p>
    <h1 class="font-display text-ink mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
      {{ t('home.hero.title') }}
    </h1>
    <p class="text-ink-soft mt-4 max-w-xl text-lg">
      {{ t('home.hero.subtitle') }}
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <RouterLink to="/login">
        <BaseButton size="lg">{{ t('home.hero.ctaLogin') }}</BaseButton>
      </RouterLink>
      <RouterLink to="/app">
        <BaseButton size="lg" variant="secondary">{{ t('home.hero.ctaApp') }}</BaseButton>
      </RouterLink>
    </div>
  </main>
</template>
