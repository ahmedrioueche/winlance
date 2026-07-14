<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { appConfig } from '@/config'
import { BaseButton, ThemeToggle } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <main class="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-page py-16">
    <div class="absolute end-page top-6">
      <ThemeToggle />
    </div>
    <p class="text-sm font-medium tracking-[0.2em] text-muted uppercase">
      {{ appConfig.appName }}
    </p>
    <h1 class="mt-4 max-w-3xl font-display text-5xl leading-tight text-ink md:text-6xl">
      {{ t('home.hero.title') }}
    </h1>
    <p class="mt-4 max-w-xl text-lg text-ink-soft">
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
