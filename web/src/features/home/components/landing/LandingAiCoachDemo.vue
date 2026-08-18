<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bot, Sparkles, MessageSquare, Copy, Check, Send } from 'lucide-vue-next'

const { t } = useI18n()

interface Scenario {
  id: string
  prompt: string
  response: string
  tip: string
}

const scenarios: Scenario[] = [
  {
    id: 'price',
    prompt: t('home.landing.aiCoach.prompt1'),
    response: `"I understand budget constraints are top of mind. Rather than cutting our engineering quality, we can adjust the initial MVP scope by decoupling [Phase 2 Features]. This brings Phase 1 down to $6,500 while maintaining project delivery deadlines."`,
    tip: 'Rule: Reframe price discussions around scope flexibility, never drop your hourly value.'
  },
  {
    id: 'ghosting',
    prompt: t('home.landing.aiCoach.prompt2'),
    response: `"Hi [Client Name], checking in to see if you have any questions on the architecture blueprint or milestone schedule we sent over. If priorities have shifted, no problem at all — just let me know if we should pause for now!"`,
    tip: 'Rule: Give the client a graceful way out to remove pressure and trigger an honest status reply.'
  },
  {
    id: 'milestones',
    prompt: t('home.landing.aiCoach.prompt3'),
    response: `"For projects over $5k, structure payments into 3 clean milestones: 40% Deposit upon contract signing, 35% on Beta Feature delivery, and 25% upon final deployment & codebase transfer."`,
    tip: 'Rule: Never start development work without a confirmed deposit.'
  }
]

const activeScenario = ref<Scenario>(scenarios[0])
const copied = ref(false)

function selectScenario(s: Scenario) {
  activeScenario.value = s
  copied.value = false
}

function copyResponse() {
  navigator.clipboard.writeText(activeScenario.value.response)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <section class="py-24 relative bg-canvas overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <Bot class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.aiCoach.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.aiCoach.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.aiCoach.subtitle') }}
        </p>
      </div>

      <!-- Live Interactive Simulator Widget -->
      <div class="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-border shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left Panel: Preset Prompts -->
          <div class="lg:col-span-5 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
              <MessageSquare class="w-3.5 h-3.5 text-accent" />
              <span>Select Sales Objection Scenario</span>
            </h3>

            <button
              v-for="s in scenarios"
              :key="s.id"
              type="button"
              @click="selectScenario(s)"
              class="w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-between gap-3"
              :class="[
                activeScenario.id === s.id
                  ? 'bg-accent-soft border-accent text-accent font-bold shadow-xs'
                  : 'bg-canvas-elevated border-border text-ink-soft hover:border-border-strong hover:text-ink'
              ]"
            >
              <span>{{ s.prompt }}</span>
              <Send class="w-3 h-3 shrink-0" />
            </button>
          </div>

          <!-- Right Panel: Real-Time Simulated Output -->
          <div class="lg:col-span-7 bg-canvas-elevated rounded-xl p-5 border border-border relative flex flex-col justify-between min-h-[280px]">
            <div>
              <div class="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                    <Sparkles class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-ink">Winlance AI Sales Coach</div>
                    <div class="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Assistant
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  @click="copyResponse"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-canvas border border-border text-xs text-ink-soft hover:text-accent transition-colors"
                >
                  <component :is="copied ? Check : Copy" class="w-3 h-3" />
                  <span>{{ copied ? 'Copied' : 'Copy Script' }}</span>
                </button>
              </div>

              <!-- Output Text Box -->
              <div class="text-sm text-ink leading-relaxed font-mono bg-canvas-muted/60 p-4 rounded-lg border border-border/60">
                {{ activeScenario.response }}
              </div>
            </div>

            <!-- Pro Sales Tip Footer -->
            <div class="mt-4 pt-3 border-t border-border/40 text-xs text-accent font-semibold flex items-center gap-2">
              <Sparkles class="w-3.5 h-3.5 shrink-0" />
              <span>{{ activeScenario.tip }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
