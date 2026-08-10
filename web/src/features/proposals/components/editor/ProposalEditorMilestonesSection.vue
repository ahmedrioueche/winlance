<script setup lang="ts">
import { CheckSquare, Plus, Sparkles, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { BaseButton, BaseInput } from '@/shared/components/base'

export interface ProposalMilestoneItem {
  id?: string
  title: string
  description?: string
  amount?: number
  percentage?: number
  due_date?: string | null
  deliverables?: string[]
}

interface Props {
  milestones: ProposalMilestoneItem[]
  totalProposalAmount: number
  isViewingPast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  milestones: () => [],
  totalProposalAmount: 0,
  isViewingPast: false,
})

const emit = defineEmits<{
  'update:milestones': [items: ProposalMilestoneItem[]]
}>()

const localMilestones = computed({
  get: () => props.milestones,
  set: (val) => emit('update:milestones', val),
})

function addMilestone() {
  const nextOrder = localMilestones.value.length + 1
  const updated = [
    ...localMilestones.value,
    {
      title: `Milestone ${nextOrder}: `,
      description: '',
      amount: 0,
      percentage: 0,
      due_date: null,
      deliverables: [''],
    },
  ]
  emit('update:milestones', updated)
}

function removeMilestone(index: number) {
  const updated = localMilestones.value.filter((_, idx) => idx !== index)
  emit('update:milestones', updated)
}

function addDeliverable(mIdx: number) {
  const list = [...localMilestones.value]
  const target = list[mIdx]
  if (target) {
    target.deliverables = [...(target.deliverables || []), '']
    emit('update:milestones', list)
  }
}

function removeDeliverable(mIdx: number, dIdx: number) {
  const list = [...localMilestones.value]
  const target = list[mIdx]
  if (target && target.deliverables) {
    target.deliverables = target.deliverables.filter((_, idx) => idx !== dIdx)
    emit('update:milestones', list)
  }
}

function updateDeliverableText(mIdx: number, dIdx: number, val: string) {
  const list = [...localMilestones.value]
  const target = list[mIdx]
  if (target && target.deliverables) {
    target.deliverables[dIdx] = val
    emit('update:milestones', list)
  }
}
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 sm:p-8 shadow-soft space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Sparkles class="h-5 w-5" />
        </div>
        <div>
          <h3 class="font-display text-base font-bold text-ink">
            Milestones &amp; Deliverables Breakdown
          </h3>
          <p class="text-xs text-muted">
            Structure your proposal into milestone phases. When accepted, these auto-generate project milestones &amp; tasks!
          </p>
        </div>
      </div>

      <BaseButton
        v-if="!isViewingPast"
        size="sm"
        variant="secondary"
        @click="addMilestone"
      >
        <Plus class="h-3.5 w-3.5" />
        <span>Add Milestone</span>
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div
      v-if="localMilestones.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-canvas p-8 text-center space-y-3"
    >
      <CheckSquare class="h-8 w-8 text-muted/50" />
      <div class="space-y-1">
        <p class="text-sm font-semibold text-ink">No Milestones Defined Yet</p>
        <p class="text-xs text-muted max-w-sm">
          Break this proposal into clear milestone phases so your client knows exactly what deliverables to expect.
        </p>
      </div>
      <BaseButton
        v-if="!isViewingPast"
        size="sm"
        @click="addMilestone"
      >
        <Plus class="h-3.5 w-3.5" />
        <span>Create First Milestone</span>
      </BaseButton>
    </div>

    <!-- Milestones List -->
    <div v-else class="space-y-5">
      <div
        v-for="(m, mIdx) in localMilestones"
        :key="m.id || mIdx"
        class="rounded-xl border border-border bg-canvas p-5 shadow-xs space-y-4 relative group"
      >
        <!-- Milestone Header Controls -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <BaseInput
              v-model="m.title"
              label="Milestone Title"
              placeholder="e.g. Milestone 1: Discovery & UX Wireframes"
              :disabled="isViewingPast"
            />
          </div>

          <button
            v-if="!isViewingPast"
            type="button"
            class="p-1.5 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-canvas-muted mt-6"
            title="Remove Milestone"
            @click="removeMilestone(mIdx)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>

        <!-- Description & Amount Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <BaseInput
              v-model="m.description"
              label="Phase Description"
              placeholder="Describe deliverables and outcomes for this phase..."
              :disabled="isViewingPast"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-ink">Phase Budget ($)</label>
            <input
              :value="m.amount"
              type="number"
              step="100"
              class="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-bold text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="0.00"
              :disabled="isViewingPast"
              @input="m.amount = Number(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Deliverable Sub-Tasks List -->
        <div class="space-y-2 pt-2 border-t border-border/60">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider">
              Deliverables &amp; Task Checklist
            </span>
            <button
              v-if="!isViewingPast"
              type="button"
              class="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              @click="addDeliverable(mIdx)"
            >
              <Plus class="h-3 w-3" />
              <span>Add Task Item</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(del, dIdx) in m.deliverables || []"
              :key="dIdx"
              class="flex items-center gap-2"
            >
              <CheckSquare class="h-4 w-4 text-accent shrink-0" />
              <input
                :value="del"
                type="text"
                class="flex-1 rounded-lg border border-border bg-canvas-elevated px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                placeholder="e.g. High-fidelity Figma wireframes"
                :readonly="isViewingPast"
                @input="updateDeliverableText(mIdx, dIdx, ($event.target as HTMLInputElement).value)"
              />
              <button
                v-if="!isViewingPast"
                type="button"
                class="p-1 text-muted hover:text-red-500 transition-colors"
                @click="removeDeliverable(mIdx, dIdx)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
