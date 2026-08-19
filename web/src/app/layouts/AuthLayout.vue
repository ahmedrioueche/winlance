<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Globe, Sparkles, Kanban, Bot, FileCheck, Star, ShieldCheck } from 'lucide-vue-next'

import { AppLogo, ThemeToggle } from '@/shared/components/base'

import { setAppLocale } from '@/i18n'

const { t, locale } = useI18n()

function toggleLocale() {
  setAppLocale(locale.value === 'fr' ? 'en' : 'fr')
}

</script>

<template>
  <div class="h-dvh max-h-dvh overflow-hidden bg-canvas text-ink flex flex-col">
    <!-- Accessibility Skip Link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lift"
    >
      {{ t('common.a11y.skipToContent') }}
    </a>

    <!-- Top Header -->
    <header class="h-16 flex-none flex items-center justify-between px-6 md:px-10 bg-canvas/80 backdrop-blur-md border-b border-border/40 z-40">
      <RouterLink to="/" class="flex items-center gap-2 group" title="Return to Landing Page">
        <AppLogo class="h-7 w-auto text-accent transition-transform group-hover:scale-105" />
      </RouterLink>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="toggleLocale"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase text-ink-soft hover:text-ink hover:bg-canvas-elevated border border-border transition-all"
          :title="`Switch to ${locale === 'en' ? 'French' : 'English'}`"
        >
          <Globe class="w-3.5 h-3.5 text-accent" />
          <span>{{ locale }}</span>
        </button>

        <ThemeToggle />
      </div>
    </header>

    <!-- Split Screen Main Body (Fits 100vh exactly) -->
    <div class="flex-1 h-[calc(100dvh-64px)] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <!-- Left Column: Form Container (No Page Scroll) -->
      <main
        id="main-content"
        tabindex="-1"
        class="h-full flex flex-col justify-center items-center px-4 py-6 sm:px-8 outline-none overflow-y-auto lg:overflow-hidden"
      >
        <div class="w-full max-w-sm sm:max-w-md mx-auto my-auto">
          <slot />
        </div>
      </main>

      <!-- Right Column: Clean UI Feature Showcase (No Image, No Scroll) -->
      <aside class="hidden lg:flex flex-col justify-between relative h-full p-8 xl:p-12 bg-gradient-to-br from-canvas-elevated via-canvas to-accent-soft/30 border-s border-border overflow-hidden selection:bg-accent-soft">
        <!-- Ambient background halos -->
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
        <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-glow-secondary/20 rounded-full blur-[120px] pointer-events-none" />

        <!-- Top Showcase Header -->
        <div class="relative z-10 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-soft text-accent border border-accent/20">
            <Sparkles class="w-3.5 h-3.5" />
            <span>{{ t('auth.showcase.badge') }}</span>
          </div>

          <h2 class="font-display text-2xl xl:text-3xl font-bold text-ink leading-tight">
            {{ t('auth.showcase.title') }} <br />
            <span class="text-gradient">{{ t('auth.showcase.titleHighlight') }}</span>
          </h2>

          <p class="text-xs xl:text-sm text-ink-soft max-w-md leading-relaxed">
            {{ t('auth.showcase.subtitle') }}
          </p>
        </div>

        <!-- Middle UI Showcase Cards (Clean, No Image) -->
        <div class="relative z-10 my-4 space-y-3">
          <!-- Module 1: CRM Pipeline -->
          <div class="flex items-center gap-4 p-4 rounded-xl border border-border/80 bg-canvas/70 backdrop-blur-md shadow-md hover:border-accent/40 transition-colors">
            <div class="p-2.5 rounded-xl bg-accent-soft text-accent flex-none">
              <Kanban class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-ink">{{ t('auth.showcase.feature1Title') }}</h4>
              <p class="text-[11px] text-ink-soft">{{ t('auth.showcase.feature1Desc') }}</p>
            </div>
          </div>

          <!-- Module 2: AI Sales Coach -->
          <div class="flex items-center gap-4 p-4 rounded-xl border border-border/80 bg-canvas/70 backdrop-blur-md shadow-md hover:border-accent/40 transition-colors">
            <div class="p-2.5 rounded-xl bg-accent-soft text-accent flex-none">
              <Bot class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-ink">{{ t('auth.showcase.feature2Title') }}</h4>
              <p class="text-[11px] text-ink-soft">{{ t('auth.showcase.feature2Desc') }}</p>
            </div>
          </div>

          <!-- Module 3: 1-Click Contracts -->
          <div class="flex items-center gap-4 p-4 rounded-xl border border-border/80 bg-canvas/70 backdrop-blur-md shadow-md hover:border-accent/40 transition-colors">
            <div class="p-2.5 rounded-xl bg-success-soft text-success flex-none">
              <FileCheck class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-ink">{{ t('auth.showcase.feature3Title') }}</h4>
              <p class="text-[11px] text-ink-soft">{{ t('auth.showcase.feature3Desc') }}</p>
            </div>
          </div>
        </div>

        <!-- Bottom Testimonial Banner -->
        <div class="relative z-10 rounded-xl border border-border bg-canvas/80 p-4 shadow-md backdrop-blur-md">
          <div class="flex items-center gap-1 text-warning mb-1.5">
            <Star v-for="i in 5" :key="i" class="w-3 h-3 fill-warning" />
          </div>
          <p class="text-[11px] text-ink italic leading-relaxed mb-2">
            {{ t('auth.showcase.testimonialQuote') }}
          </p>
          <div class="flex items-center justify-between text-[10px]">
            <div>
              <span class="font-bold text-ink">{{ t('auth.showcase.testimonialAuthor') }}</span>
              <span class="text-ink-soft"> — {{ t('auth.showcase.testimonialRole') }}</span>
            </div>
            <div class="flex items-center gap-1 text-success font-medium">
              <ShieldCheck class="w-3 h-3" />
              <span>{{ t('auth.showcase.testimonialBadge') }}</span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  </div>
</template>
