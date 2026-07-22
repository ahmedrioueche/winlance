<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()

const sections = [
  { key: 'leads', to: '/app/leads' },
  { key: 'outreach', to: '/app/outreach' },
  { key: 'proposals', to: '/app/proposals' },
  { key: 'contracts', to: '/app/contracts' },
  { key: 'projects', to: '/app/projects' },
  { key: 'coach', to: '/app/ai-coach' },
  { key: 'analytics', to: '/app/analytics' },
] as const
</script>

<template>
  <article class="guide-page w-full">
    <RouterLink
      class="inline-flex text-sm text-muted transition hover:text-ink"
      to="/app"
    >
      ← {{ t('home.guide.back') }}
    </RouterLink>

    <header class="mt-6">
      <h1 class="font-display text-4xl tracking-tight text-ink md:text-5xl">
        {{ t('home.guide.title') }}
      </h1>
      <p class="mt-3 max-w-xl text-lg text-ink-soft">
        {{ t('home.guide.subtitle') }}
      </p>
    </header>

    <ol class="mt-14 space-y-12">
      <li
        v-for="(section, index) in sections"
        :key="section.key"
        class="guide-step border-t border-border pt-8"
      >
        <p class="font-display text-sm tracking-[0.2em] text-accent uppercase">
          {{ String(index + 1).padStart(2, '0') }}
        </p>
        <h2 class="mt-3 font-display text-2xl text-ink">
          {{ t(`home.guide.sections.${section.key}.title`) }}
        </h2>
        <p class="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          {{ t(`home.guide.sections.${section.key}.body`) }}
        </p>
        <RouterLink class="mt-5 inline-flex" :to="section.to">
          <BaseButton variant="secondary" size="sm">
            {{ t(`home.guide.sections.${section.key}.cta`) }}
          </BaseButton>
        </RouterLink>
      </li>
    </ol>
  </article>
</template>

<style scoped>
.guide-page {
  animation: guide-enter 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.guide-step {
  animation: guide-enter 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.guide-step:nth-child(1) {
  animation-delay: 40ms;
}
.guide-step:nth-child(2) {
  animation-delay: 80ms;
}
.guide-step:nth-child(3) {
  animation-delay: 120ms;
}
.guide-step:nth-child(4) {
  animation-delay: 160ms;
}
.guide-step:nth-child(5) {
  animation-delay: 200ms;
}
.guide-step:nth-child(6) {
  animation-delay: 240ms;
}
.guide-step:nth-child(7) {
  animation-delay: 280ms;
}

@keyframes guide-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide-page,
  .guide-step {
    animation: none;
  }
}
</style>
