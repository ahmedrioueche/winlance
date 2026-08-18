<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { DollarSign, Users, Star, Clock } from 'lucide-vue-next'

const { t } = useI18n()

const stats = [
  {
    icon: DollarSign,
    value: t('home.landing.ticker.stat1'),
    label: t('home.landing.ticker.stat1Label'),
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    icon: Users,
    value: t('home.landing.ticker.stat2'),
    label: t('home.landing.ticker.stat2Label'),
    color: 'text-accent',
    bg: 'bg-accent/10'
  },
  {
    icon: Star,
    value: t('home.landing.ticker.stat3'),
    label: t('home.landing.ticker.stat3Label'),
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    icon: Clock,
    value: t('home.landing.ticker.stat4'),
    label: t('home.landing.ticker.stat4Label'),
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  }
]

const stackLogos = [
  'Full-Stack Web', 'Mobile & iOS', 'Backend APIs', 'AI & Machine Learning', 'DevOps & Cloud', 'SaaS Architecture'
]
</script>

<template>
  <section class="py-12 border-y border-border/60 bg-canvas-muted/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div
          v-for="(stat, idx) in stats"
          :key="idx"
          class="p-4 rounded-2xl glass-card flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
        >
          <div :class="[stat.bg, stat.color]" class="p-3 rounded-xl mb-3">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="text-3xl sm:text-4xl font-bold font-display text-ink">{{ stat.value }}</div>
          <div class="text-xs sm:text-sm font-medium text-ink-soft mt-1">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Developer Specialization Tags -->
      <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted mr-2">Built for devs in:</span>
        <span
          v-for="logo in stackLogos"
          :key="logo"
          class="px-3 py-1 rounded-md bg-canvas-elevated border border-border text-xs font-medium text-ink-soft shadow-xs hover:border-accent transition-colors"
        >
          {{ logo }}
        </span>
      </div>
    </div>
  </section>
</template>
