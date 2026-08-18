<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Layers, Users, Mail, Bot, FileText, FileCheck, LayoutDashboard } from 'lucide-vue-next'

const { t } = useI18n()

const features = [
  {
    icon: Users,
    title: t('home.landing.bento.bento1Title'),
    desc: t('home.landing.bento.bento1Desc'),
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    gridClass: 'lg:col-span-2 lg:row-span-1'
  },
  {
    icon: Mail,
    title: t('home.landing.bento.bento2Title'),
    desc: t('home.landing.bento.bento2Desc'),
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    gridClass: 'lg:col-span-1 lg:row-span-1'
  },
  {
    icon: Bot,
    title: t('home.landing.bento.bento3Title'),
    desc: t('home.landing.bento.bento3Desc'),
    color: 'text-accent',
    bg: 'bg-accent/10',
    gridClass: 'lg:col-span-1 lg:row-span-1'
  },
  {
    icon: FileText,
    title: t('home.landing.bento.bento4Title'),
    desc: t('home.landing.bento.bento4Desc'),
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    gridClass: 'lg:col-span-2 lg:row-span-1'
  },
  {
    icon: FileCheck,
    title: t('home.landing.bento.bento5Title'),
    desc: t('home.landing.bento.bento5Desc'),
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    gridClass: 'lg:col-span-1.5 lg:row-span-1'
  },
  {
    icon: LayoutDashboard,
    title: t('home.landing.bento.bento6Title'),
    desc: t('home.landing.bento.bento6Desc'),
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    gridClass: 'lg:col-span-1.5 lg:row-span-1'
  }
]
</script>

<template>
  <section id="features" class="py-24 relative bg-canvas-muted/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <Layers class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.bento.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.bento.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.bento.subtitle') }}
        </p>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, idx) in features"
          :key="idx"
          :class="[feature.gridClass]"
          class="p-8 rounded-2xl glass-card border border-border/80 hover:border-accent/60 transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between"
        >
          <div>
            <div :class="[feature.bg, feature.color]" class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-ink group-hover:text-accent transition-colors">
              {{ feature.title }}
            </h3>
            <p class="mt-3 text-sm text-ink-soft leading-relaxed">
              {{ feature.desc }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Learn more about {{ feature.title }}</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
