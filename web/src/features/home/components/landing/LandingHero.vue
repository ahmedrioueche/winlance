<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-vue-next'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <section class="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
    <!-- Ambient Backdrop Halos -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
    <div class="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-glow-secondary/15 rounded-full blur-[120px] pointer-events-none" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <!-- Badge Pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20 mb-8 shadow-sm">
        <Sparkles class="w-3.5 h-3.5" />
        <span>{{ t('home.landing.hero.badge') }}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink max-w-4xl mx-auto leading-[1.15]">
        {{ t('home.landing.hero.titleMain') }} <br />
        <span class="text-gradient">{{ t('home.landing.hero.titleHighlight') }}</span>
      </h1>

      <!-- Subtitle -->
      <p class="mt-6 text-lg sm:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
        {{ t('home.landing.hero.subtitle') }}
      </p>

      <!-- CTAs -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <RouterLink to="/register">
          <BaseButton size="lg" class="w-full sm:w-auto px-8 py-3.5 text-base shadow-xl shadow-accent/25 group">
            <span>{{ t('home.landing.hero.ctaPrimary') }}</span>
            <ArrowRight class="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </BaseButton>
        </RouterLink>
        <a href="#demos">
          <BaseButton variant="secondary" size="lg" class="w-full sm:w-auto px-8 py-3.5 text-base">
            {{ t('home.landing.hero.ctaSecondary') }}
          </BaseButton>
        </a>
      </div>

      <!-- Key Benefits Micro-List -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-ink-soft">
        <div class="flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-success" />
          <span>{{ t('home.landing.hero.noCard') }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Zap class="w-4 h-4 text-warning" />
          <span>{{ t('home.landing.hero.fastSetup') }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <TrendingUp class="w-4 h-4 text-accent" />
          <span>{{ t('home.landing.hero.builtForDevs') }}</span>
        </div>
      </div>

      <!-- App Hero Visual & Floating Badges -->
      <div class="mt-14 relative max-w-5xl mx-auto group">
        <!-- Outer Glow Ring -->
        <div class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/40 via-glow/30 to-accent/40 blur-xl opacity-50 group-hover:opacity-75 transition duration-1000" />
        
        <!-- Main Screenshot Frame -->
        <div class="relative rounded-2xl border border-border bg-canvas-elevated shadow-2xl overflow-hidden">
          <img
            src="/hero_dashboard.png"
            alt="Winlance Client Acquisition OS Dashboard"
            class="w-full h-auto object-cover rounded-2xl transform transition-transform duration-700 hover:scale-[1.01]"
          />
        </div>

        <!-- Floating Badge 1: Proposal Closed -->
        <div class="hidden md:flex absolute -top-6 -left-6 items-center gap-3 px-4 py-2.5 rounded-xl glass-card text-ink text-xs font-semibold shadow-2xl animate-float">
          <div class="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success">
            <TrendingUp class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] text-ink-soft uppercase tracking-wider">{{ t('home.landing.hero.proposalClosed') }}</div>
            <div class="text-sm font-bold text-success">+$14,500.00</div>
          </div>
        </div>

        <!-- Floating Badge 2: Contract Signed -->
        <div class="hidden md:flex absolute -bottom-6 -right-6 items-center gap-3 px-4 py-2.5 rounded-xl glass-card text-ink text-xs font-semibold shadow-2xl animate-float-delayed">
          <div class="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Zap class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] text-ink-soft uppercase tracking-wider">{{ t('home.landing.hero.clientSigned') }}</div>
            <div class="text-sm font-bold text-ink">{{ t('home.landing.hero.contractPdf') }}</div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
