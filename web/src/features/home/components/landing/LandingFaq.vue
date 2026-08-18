<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { HelpCircle, ChevronDown } from 'lucide-vue-next'

const { t } = useI18n()

const openIndex = ref<number | null>(0)

const faqs = [
  {
    q: 'What makes Winlance different from general freelancing platforms?',
    a: 'Winlance focuses exclusively on one high-value pipeline: turning potential leads into paying clients and repeat referrals. It leaves out generic accounting, tax filing, and unnecessary fluff to provide a laser-focused OS for solo developers.'
  },
  {
    q: 'How does the AI Sales Coach help with client negotiation?',
    a: 'The AI Assistant is trained specifically on software engineering sales scenarios — pricing pushback, scoping, follow-up cadence, and deposit structures. Simply select your situation or type your question for instant actionable advice.'
  },
  {
    q: 'Do my clients need to create a Winlance account to view the Client Portal?',
    a: 'No! You can share a secure, live client portal link. Your client can view sprint progress, milestones, and deliverable files directly without any login friction.'
  },
  {
    q: 'Can I export contracts as PDFs?',
    a: 'Yes! Winlance features a 1-click contract generator that turns accepted proposal data directly into clean, binding PDF contracts.'
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, every account comes with a full 14-day free trial of the Pro Solo plan. No credit card is required to get started.'
  }
]

function toggleFaq(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>

<template>
  <section id="faq" class="py-24 relative bg-canvas">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <HelpCircle class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.faq.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.faq.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.faq.subtitle') }}
        </p>
      </div>

      <!-- Accordion Items -->
      <div class="space-y-4">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="rounded-xl border transition-all duration-200 overflow-hidden"
          :class="[
            openIndex === idx
              ? 'bg-canvas-elevated border-accent shadow-md'
              : 'bg-canvas-muted/40 border-border hover:border-border-strong'
          ]"
        >
          <button
            type="button"
            @click="toggleFaq(idx)"
            class="w-full p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-ink"
          >
            <span>{{ faq.q }}</span>
            <ChevronDown
              class="w-5 h-5 text-accent shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openIndex === idx }"
            />
          </button>

          <div
            v-if="openIndex === idx"
            class="px-5 pb-5 text-xs sm:text-sm text-ink-soft leading-relaxed border-t border-border/40 pt-3"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
