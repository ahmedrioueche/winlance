<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Check, Zap, Sparkles } from 'lucide-vue-next'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()
const isAnnual = ref(true)

const plans = [
  {
    id: 'starter',
    name: t('home.landing.pricing.freeTitle'),
    priceMonthly: '$0',
    priceAnnual: '$0',
    period: 'forever free',
    popular: false,
    cta: t('home.landing.pricing.ctaFree'),
    features: [
      'Up to 5 Active Leads',
      'Visual Pipeline Board',
      'Cold Email Script Templates',
      '1 Active Client Portal'
    ]
  },
  {
    id: 'pro',
    name: t('home.landing.pricing.proTitle'),
    priceMonthly: '$29',
    priceAnnual: '$23',
    period: 'per month',
    popular: true,
    cta: t('home.landing.pricing.ctaPro'),
    features: [
      'Unlimited Active Leads & Pipeline',
      'Unlimited Proposal & Contract PDFs',
      'Unlimited AI Sales Coach Assistant',
      'Unlimited Client Project Portals',
      'Custom Branding on Client Portals'
    ]
  },
  {
    id: 'growth',
    name: t('home.landing.pricing.growthTitle'),
    priceMonthly: '$79',
    priceAnnual: '$63',
    period: 'per month',
    popular: false,
    cta: t('home.landing.pricing.ctaGrowth'),
    features: [
      'Everything in Pro Solo',
      'Custom Domain for Client Portals',
      'Advanced Funnel & Analytics',
      'Multi-currency Proposals',
      'Dedicated Priority Support'
    ]
  }
]
</script>

<template>
  <section id="pricing" class="py-24 relative bg-canvas-muted/30 border-y border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <Zap class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.pricing.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.pricing.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.pricing.subtitle') }}
        </p>

        <!-- Billing Cycle Toggle Switch -->
        <div class="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-canvas-elevated border border-border shadow-xs">
          <button
            type="button"
            @click="isAnnual = false"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            :class="[!isAnnual ? 'bg-accent text-accent-foreground shadow-xs' : 'text-ink-soft hover:text-ink']"
          >
            {{ t('home.landing.pricing.monthly') }}
          </button>
          <button
            type="button"
            @click="isAnnual = true"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
            :class="[isAnnual ? 'bg-accent text-accent-foreground shadow-xs' : 'text-ink-soft hover:text-ink']"
          >
            <span>{{ t('home.landing.pricing.annual') }}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] uppercase font-extrabold">
              {{ t('home.landing.pricing.discount') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="rounded-2xl p-8 border relative flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5"
          :class="[
            plan.popular
              ? 'glass-card border-accent shadow-2xl shadow-accent/15 ring-2 ring-accent/30'
              : 'bg-canvas-elevated border-border'
          ]"
        >
          <!-- Popular Badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1"
          >
            <Sparkles class="w-3 h-3" />
            <span>Most Popular Choice</span>
          </div>

          <div>
            <h3 class="text-xl font-bold text-ink mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-1 my-4">
              <span class="text-4xl font-extrabold font-display text-ink">
                {{ isAnnual ? plan.priceAnnual : plan.priceMonthly }}
              </span>
              <span class="text-xs text-ink-soft font-medium">/ {{ plan.period }}</span>
            </div>

            <!-- Feature List -->
            <ul class="space-y-3 my-6 text-xs text-ink-soft">
              <li v-for="(feat, fIdx) in plan.features" :key="fIdx" class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-accent shrink-0" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <!-- CTA Button -->
          <RouterLink to="/register" class="w-full block">
            <BaseButton
              :variant="plan.popular ? 'primary' : 'secondary'"
              class="w-full justify-center py-2.5 text-xs font-bold"
            >
              {{ plan.cta }}
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
