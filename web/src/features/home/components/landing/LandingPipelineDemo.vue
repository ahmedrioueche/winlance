<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Kanban, MoveRight, User } from 'lucide-vue-next'

const { t } = useI18n()

interface Lead {
  id: string
  name: string
  company: string
  value: number
  probability: number
  stage: 'new' | 'contacted' | 'discovery' | 'proposal' | 'won'
  badge: string
}

const leads = ref<Lead[]>([
  { id: '1', name: 'Alex Rivera', company: 'Acme SaaS', value: 12500, probability: 40, stage: 'new', badge: 'Vue + Node' },
  { id: '2', name: 'Sarah Chen', company: 'FinTech Dynamics', value: 18000, probability: 60, stage: 'contacted', badge: 'Full-Stack' },
  { id: '3', name: 'Michael Scott', company: 'Dunder Data', value: 9500, probability: 75, stage: 'discovery', badge: 'AI Integration' },
  { id: '4', name: 'Elena Rostova', company: 'CloudScale Inc', value: 24000, probability: 90, stage: 'proposal', badge: 'Mobile App' },
  { id: '5', name: 'David Kim', company: 'Nexus AI', value: 15000, probability: 100, stage: 'won', badge: 'Signed Contract' }
])

const stages = [
  { id: 'new', label: t('home.landing.pipeline.stageNew'), color: 'border-blue-500/40 text-blue-500' },
  { id: 'contacted', label: t('home.landing.pipeline.stageContacted'), color: 'border-amber-500/40 text-amber-500' },
  { id: 'discovery', label: t('home.landing.pipeline.stageDiscovery'), color: 'border-purple-500/40 text-purple-500' },
  { id: 'proposal', label: t('home.landing.pipeline.stageProposal'), color: 'border-accent/40 text-accent' },
  { id: 'won', label: t('home.landing.pipeline.stageWon'), color: 'border-emerald-500/40 text-emerald-500' }
]

function moveLeadNext(leadId: string) {
  const order: Lead['stage'][] = ['new', 'contacted', 'discovery', 'proposal', 'won']
  const item = leads.value.find(l => l.id === leadId)
  if (item) {
    const currentIdx = order.indexOf(item.stage)
    if (currentIdx < order.length - 1) {
      item.stage = order[currentIdx + 1]
    } else {
      item.stage = 'new'
    }
  }
}

function getTotalPipelineValue() {
  return leads.value.reduce((acc, l) => acc + l.value, 0).toLocaleString()
}
</script>

<template>
  <section id="demos" class="py-24 relative overflow-hidden bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
          <Kanban class="w-3.5 h-3.5" />
          <span>{{ t('home.landing.pipeline.tag') }}</span>
        </div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold text-ink">
          {{ t('home.landing.pipeline.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-ink-soft">
          {{ t('home.landing.pipeline.subtitle') }}
        </p>
      </div>

      <!-- Live Interactive Kanban Board Container -->
      <div class="glass-card rounded-2xl p-6 border border-border shadow-2xl">
        <!-- Top Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-accent-soft text-accent">
              <Kanban class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-ink">Active Client Pipeline</h3>
              <p class="text-xs text-ink-soft">Click any lead card to advance it to the next stage</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs font-semibold">
            <div class="px-3 py-1.5 rounded-lg bg-canvas-elevated border border-border">
              <span class="text-ink-soft mr-1.5">Total Pipeline Value:</span>
              <span class="text-emerald-500 font-bold">${{ getTotalPipelineValue() }}</span>
            </div>
          </div>
        </div>

        <!-- Kanban Columns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            v-for="stage in stages"
            :key="stage.id"
            class="bg-canvas-muted/50 rounded-xl p-3 border border-border/50 flex flex-col min-h-[320px]"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
              <span class="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent" />
                {{ stage.label }}
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-canvas-elevated border border-border text-ink-soft">
                {{ leads.filter(l => l.stage === stage.id).length }}
              </span>
            </div>

            <!-- Leads Cards -->
            <div class="flex-1 space-y-3">
              <div
                v-for="lead in leads.filter(l => l.stage === stage.id)"
                :key="lead.id"
                @click="moveLeadNext(lead.id)"
                class="group p-3.5 rounded-xl bg-canvas-elevated border border-border hover:border-accent shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-ink group-hover:text-accent transition-colors flex items-center gap-1.5">
                    <User class="w-3.5 h-3.5 text-muted" />
                    {{ lead.name }}
                  </span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent">
                    {{ lead.badge }}
                  </span>
                </div>
                <div class="text-xs text-ink-soft mb-3 font-medium">{{ lead.company }}</div>
                
                <div class="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <span class="font-bold text-emerald-500 flex items-center gap-0.5">
                    ${{ lead.value.toLocaleString() }}
                  </span>
                  <button type="button" class="text-xs text-accent flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Advance</span>
                    <MoveRight class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Empty Stage Indicator -->
              <div
                v-if="leads.filter(l => l.stage === stage.id).length === 0"
                class="h-28 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-xs text-muted"
              >
                Drag / Click lead here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
