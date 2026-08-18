<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FileCheck, Zap, CheckCircle2, FileCode, Shield } from 'lucide-vue-next'

const { t } = useI18n()

const steps = [
  {
    icon: FileCode,
    title: t('home.landing.workflow.step1Title'),
    desc: t('home.landing.workflow.step1Desc'),
    badge: 'Step 1'
  },
  {
    icon: Zap,
    title: t('home.landing.workflow.step2Title'),
    desc: t('home.landing.workflow.step2Desc'),
    badge: 'Step 2'
  },
  {
    icon: Shield,
    title: t('home.landing.workflow.step3Title'),
    desc: t('home.landing.workflow.step3Desc'),
    badge: 'Step 3'
  }
]
</script>

<template>
  <section class="py-24 relative bg-canvas-muted/30 border-y border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <FileCheck class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.workflow.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.workflow.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.workflow.subtitle') }}
        </p>
      </div>

      <!-- Steps Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="p-8 rounded-2xl glass-card border border-border/80 relative flex flex-col justify-between group hover:border-accent transition-all duration-300 transform hover:-translate-y-1.5"
        >
          <div>
            <div class="flex items-center justify-between mb-6">
              <div class="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold">
                <component :is="step.icon" class="w-6 h-6" />
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-canvas-elevated border border-border text-ink-soft">
                {{ step.badge }}
              </span>
            </div>

            <h3 class="text-xl font-bold text-ink group-hover:text-accent transition-colors">
              {{ step.title }}
            </h3>
            <p class="mt-3 text-sm text-ink-soft leading-relaxed">
              {{ step.desc }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-semibold text-emerald-500">
            <CheckCircle2 class="w-4 h-4" />
            <span>Automated & Instant</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
