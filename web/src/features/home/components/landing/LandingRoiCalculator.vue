<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calculator, Award, Target } from 'lucide-vue-next'

const { t } = useI18n()

const targetRevenue = ref(12000)
const avgProjectRate = ref(4500)
const monthlyLeads = ref(15)

const requiredDeals = computed(() => {
  if (!avgProjectRate.value) return 0
  return Math.ceil(targetRevenue.value / avgProjectRate.value)
})

const requiredCloseRate = computed(() => {
  if (!monthlyLeads.value || !requiredDeals.value) return 0
  const rate = (requiredDeals.value / monthlyLeads.value) * 100
  return Math.min(Math.round(rate), 100)
})

const projectedWinlanceRevenue = computed(() => {
  const boost = 1.35 // +35% win rate improvement
  return Math.round(targetRevenue.value * boost)
})
</script>

<template>
  <section id="roi" class="py-24 relative bg-canvas overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <Calculator class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.roi.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.roi.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.roi.subtitle') }}
        </p>
      </div>

      <!-- Calculator Card -->
      <div class="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-10 border border-border shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Sliders Left Panel -->
          <div class="lg:col-span-7 space-y-8">
            <!-- Slider 1: Target Monthly Revenue -->
            <div>
              <div class="flex items-center justify-between mb-2 text-sm font-bold text-ink">
                <span>{{ t('home.landing.roi.targetIncome') }}</span>
                <span class="text-accent text-base">${{ targetRevenue.toLocaleString() }} / mo</span>
              </div>
              <input
                type="range"
                min="3000"
                max="30000"
                step="1000"
                v-model.number="targetRevenue"
                class="w-full h-2 rounded-lg bg-canvas-elevated accent-accent cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-muted mt-1">
                <span>$3,000</span>
                <span>$30,000+</span>
              </div>
            </div>

            <!-- Slider 2: Average Project Rate -->
            <div>
              <div class="flex items-center justify-between mb-2 text-sm font-bold text-ink">
                <span>{{ t('home.landing.roi.avgProjectRate') }}</span>
                <span class="text-accent text-base">${{ avgProjectRate.toLocaleString() }}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                v-model.number="avgProjectRate"
                class="w-full h-2 rounded-lg bg-canvas-elevated accent-accent cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-muted mt-1">
                <span>$1,000</span>
                <span>$15,000</span>
              </div>
            </div>

            <!-- Slider 3: Leads Contacted / Month -->
            <div>
              <div class="flex items-center justify-between mb-2 text-sm font-bold text-ink">
                <span>{{ t('home.landing.roi.leadsPerMonth') }}</span>
                <span class="text-accent text-base">{{ monthlyLeads }} leads</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                v-model.number="monthlyLeads"
                class="w-full h-2 rounded-lg bg-canvas-elevated accent-accent cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-muted mt-1">
                <span>5 leads</span>
                <span>50 leads</span>
              </div>
            </div>
          </div>

          <!-- Results Right Panel -->
          <div class="lg:col-span-5 bg-canvas-elevated rounded-2xl p-6 border border-border shadow-md flex flex-col justify-between space-y-6">
            <div class="text-center pb-4 border-b border-border">
              <div class="text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">
                Projected Monthly Revenue
              </div>
              <div class="text-4xl font-extrabold font-display text-emerald-500">
                ${{ projectedWinlanceRevenue.toLocaleString() }}
              </div>
              <div class="text-[11px] text-emerald-500 font-semibold mt-1">
                +$3,500/mo boost with organized CRM
              </div>
            </div>

            <div class="space-y-4 text-xs font-semibold text-ink-soft">
              <div class="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border">
                <span class="flex items-center gap-2">
                  <Target class="w-4 h-4 text-accent" />
                  Deals Needed / Month
                </span>
                <span class="text-ink font-bold text-sm">{{ requiredDeals }} deals</span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border">
                <span class="flex items-center gap-2">
                  <Award class="w-4 h-4 text-amber-500" />
                  Required Close Rate
                </span>
                <span class="text-ink font-bold text-sm">{{ requiredCloseRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
