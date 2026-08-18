<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-vue-next'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <section class="py-20 relative bg-canvas overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="relative rounded-3xl p-10 sm:p-16 border border-accent/40 bg-gradient-to-br from-accent/20 via-canvas-elevated to-glow-secondary/20 shadow-2xl overflow-hidden text-center">
        <!-- Ambient background halo -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-soft text-accent border border-accent/20 mb-6">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Start Winning Work Today</span>
        </div>

        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink max-w-2xl mx-auto leading-tight">
          {{ t('home.landing.cta.title') }}
        </h2>

        <p class="mt-4 text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
          {{ t('home.landing.cta.subtitle') }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <RouterLink to="/register">
            <BaseButton size="lg" class="px-8 py-3.5 text-base shadow-xl shadow-accent/25 group">
              <span>{{ t('home.landing.cta.button') }}</span>
              <ArrowRight class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </BaseButton>
          </RouterLink>
        </div>

        <div class="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-ink-soft">
          <ShieldCheck class="w-4 h-4 text-success" />
          <span>{{ t('home.landing.cta.note') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
