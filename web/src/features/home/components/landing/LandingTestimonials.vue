<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Star, MessageSquareQuote, CheckCircle } from 'lucide-vue-next'

const { t } = useI18n()

const testimonials = [
  {
    name: 'Marcus Vance',
    role: 'Senior Full-Stack Freelancer',
    stack: 'React + Node + AWS',
    metric: 'Closed $22k deal in Week 2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content: 'Winlance turned my messy client outreach into a calm machine. The AI Sales Coach alone saved me from discounting a $12k contract when the client pushed back.'
  },
  {
    name: 'Sophia Laurent',
    role: 'Mobile & iOS Engineer',
    stack: 'SwiftUI + Flutter',
    metric: '+45% Win Rate Boost',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    content: 'Clients love the transparent project portal link. Instead of back-and-forth emails every 2 days, they check milestone progress themselves and send referrals.'
  },
  {
    name: 'Daniel Ortega',
    role: 'AI & Python Specialist',
    stack: 'FastAPI + PyTorch',
    metric: 'Saved 8+ hrs / week',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: 'Going from proposal acceptance to 1-click contract PDF used to take me 3 hours of manual drafting. Winlance generates it in 10 seconds flat.'
  }
]
</script>

<template>
  <section class="py-24 relative bg-canvas overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <MessageSquareQuote class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.testimonials.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.testimonials.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.testimonials.subtitle') }}
        </p>
      </div>

      <!-- Testimonial Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(card, idx) in testimonials"
          :key="idx"
          class="p-8 rounded-2xl glass-card border border-border flex flex-col justify-between hover:border-accent/60 transition-all duration-300 transform hover:-translate-y-1.5"
        >
          <div>
            <!-- Star Rating -->
            <div class="flex items-center gap-1 text-amber-500 mb-6">
              <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-amber-500" />
            </div>

            <!-- Quote -->
            <p class="text-sm text-ink leading-relaxed italic">
              "{{ card.content }}"
            </p>
          </div>

          <!-- Developer Profile & Outcome Badge -->
          <div class="mt-8 pt-6 border-t border-border/40">
            <div class="flex items-center gap-3">
              <img :src="card.avatar" :alt="card.name" class="w-10 h-10 rounded-full object-cover border border-border" />
              <div>
                <div class="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>{{ card.name }}</span>
                  <CheckCircle class="w-3.5 h-3.5 text-accent" />
                </div>
                <div class="text-xs text-ink-soft">{{ card.role }}</div>
              </div>
            </div>

            <div class="mt-3 inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[11px] font-bold">
              ⚡ Metric: {{ card.metric }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
