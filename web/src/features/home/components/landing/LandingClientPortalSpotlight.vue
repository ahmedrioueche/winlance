<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LayoutDashboard, CheckCircle2, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()

const portalPoints = [
  {
    title: t('home.landing.portal.feature1'),
    desc: 'Share live sprint & milestone progress so clients know exact delivery status without emailing you.'
  },
  {
    title: t('home.landing.portal.feature2'),
    desc: 'Store all final files, Figma links, and code handoff assets in one secure link.'
  },
  {
    title: t('home.landing.portal.feature3'),
    desc: 'Client can sign off on milestones with 1 click, unlocking escrow or milestone payments.'
  }
]
</script>

<template>
  <section class="py-24 relative bg-canvas-muted/30 border-y border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Text Left Column -->
        <div class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
            <LayoutDashboard class="w-3.5 h-3.5" />
            <span>{{ t('home.landing.portal.tag') }}</span>
          </div>

          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {{ t('home.landing.portal.title') }}
          </h2>

          <p class="text-base sm:text-lg text-ink-soft leading-relaxed">
            {{ t('home.landing.portal.subtitle') }}
          </p>

          <div class="space-y-4 pt-2">
            <div
              v-for="(point, idx) in portalPoints"
              :key="idx"
              class="flex items-start gap-3 p-3.5 rounded-xl bg-canvas-elevated border border-border"
            >
              <div class="p-1 rounded-full bg-success/20 text-success mt-0.5">
                <CheckCircle2 class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-ink">{{ point.title }}</h4>
                <p class="text-xs text-ink-soft mt-0.5">{{ point.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Portal Preview Graphic Right Column -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-6 border border-border shadow-2xl relative">
          <!-- Header Bar of Mock Portal -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500/80" />
              <div class="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div class="w-3 h-3 rounded-full bg-green-500/80" />
              <span class="text-xs text-muted font-mono ml-2">portal.winlance.app/p/acme-crm</span>
            </div>
            <span class="px-2.5 py-1 rounded bg-accent-soft text-accent text-[10px] font-bold uppercase tracking-wider">
              Client Live View
            </span>
          </div>

          <!-- Mock Portal Content -->
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-canvas border border-border">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-ink">Project: Acme AI Integration</span>
                <span class="text-xs font-bold text-success">85% Completed</span>
              </div>
              <div class="w-full h-2 rounded-full bg-canvas-elevated overflow-hidden">
                <div class="h-full bg-success rounded-full w-[85%]" />
              </div>
            </div>

            <div class="space-y-2">
              <div class="p-3 rounded-lg bg-canvas border border-border/80 flex items-center justify-between text-xs">
                <span class="text-ink font-semibold flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-success" />
                  Milestone 1: Database Schema & Auth Setup
                </span>
                <span class="text-success font-bold">Approved</span>
              </div>
              <div class="p-3 rounded-lg bg-canvas border border-border/80 flex items-center justify-between text-xs">
                <span class="text-ink font-semibold flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-success" />
                  Milestone 2: Stripe Billing Integration
                </span>
                <span class="text-success font-bold">Approved</span>
              </div>
              <div class="p-3 rounded-lg bg-canvas border border-accent/40 flex items-center justify-between text-xs">
                <span class="text-accent font-semibold flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-accent" />
                  Milestone 3: AI Assistant Dashboard
                </span>
                <span class="text-accent font-bold">In Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
