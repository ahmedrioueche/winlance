<script setup lang="ts">
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'
import { CheckSquare, Info, Plus, Sparkles, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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

const { t } = useI18n()

const localMilestones = computed({
  get: () => props.milestones,
  set: (val) => emit('update:milestones', val),
})

const milestoneSum = computed(() => {
  return localMilestones.value.reduce((acc, m) => acc + (Number(m.amount) || 0), 0)
})

const confirmModalOpen = ref(false)
const pendingDelete = ref<{
  type: 'milestone' | 'deliverable' | 'milestoneCount'
  mIdx: number
  dIdx?: number
  targetCount?: number
  title?: string
} | null>(null)

function promptRemoveMilestone(index: number) {
  const m = localMilestones.value[index]
  const milestoneTitle = m?.title || t('proposals.editor.milestones.milestoneTitlePlaceholder', { num: index + 1 })
  pendingDelete.value = {
    type: 'milestone',
    mIdx: index,
    title: milestoneTitle,
  }
  confirmModalOpen.value = true
}

function promptRemoveDeliverable(mIdx: number, dIdx: number) {
  const m = localMilestones.value[mIdx]
  const dText = m?.deliverables?.[dIdx] || ''
  pendingDelete.value = {
    type: 'deliverable',
    mIdx,
    dIdx,
    title: dText.trim() ? `"${dText.trim()}"` : t('proposals.editor.milestones.deliverableItem', 'this task item'),
  }
  confirmModalOpen.value = true
}

function promptSetMilestonesCount(targetCount: number) {
  const currentCount = localMilestones.value.length
  if (targetCount >= currentCount) {
    setMilestonesCount(targetCount)
  } else {
    pendingDelete.value = {
      type: 'milestoneCount',
      mIdx: -1,
      targetCount,
    }
    confirmModalOpen.value = true
  }
}

function handleConfirmDelete() {
  if (!pendingDelete.value) return

  if (pendingDelete.value.type === 'milestone') {
    removeMilestone(pendingDelete.value.mIdx)
  } else if (pendingDelete.value.type === 'deliverable' && pendingDelete.value.dIdx !== undefined) {
    removeDeliverable(pendingDelete.value.mIdx, pendingDelete.value.dIdx)
  } else if (pendingDelete.value.type === 'milestoneCount' && pendingDelete.value.targetCount !== undefined) {
    setMilestonesCount(pendingDelete.value.targetCount)
  }

  confirmModalOpen.value = false
  pendingDelete.value = null
}

function setMilestonesCount(targetCount: number) {
  const currentCount = localMilestones.value.length
  if (targetCount > currentCount) {
    const toAdd = targetCount - currentCount
    const updated = [...localMilestones.value]
    for (let i = 0; i < toAdd; i++) {
      const nextOrder = updated.length + 1
      updated.push({
        title: t('proposals.editor.milestones.milestoneTitlePlaceholder', { num: nextOrder }),
        description: '',
        amount: 0,
        percentage: 0,
        due_date: null,
        deliverables: [''],
      })
    }
    emit('update:milestones', updated)
  } else if (targetCount < currentCount) {
    emit('update:milestones', localMilestones.value.slice(0, targetCount))
  }
}

function addMilestone() {
  const nextOrder = localMilestones.value.length + 1
  const updated = [
    ...localMilestones.value,
    {
      title: t('proposals.editor.milestones.milestoneTitlePlaceholder', { num: nextOrder }),
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
  <div class="border-border bg-canvas-elevated shadow-soft space-y-5 sm:space-y-6 rounded-2xl border p-4 sm:p-6 md:p-8">
    <!-- Header -->
    <div class="border-border/60 space-y-3 border-b pb-4">
      <!-- Top Row: Icon + Title + Info Tooltip + Budget Sum Badge -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <div
            class="bg-accent/10 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <Sparkles class="h-5 w-5" />
          </div>
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <h3 class="font-display text-ink truncate text-sm sm:text-base font-bold">
              <span class="hidden sm:inline">{{ t('proposals.editor.milestones.title', 'Milestones & Deliverables Breakdown') }}</span>
              <span class="sm:hidden">Milestones</span>
            </h3>
            <!-- Info Tooltip Icon -->
            <span
              class="text-muted hover:text-accent hover:bg-accent/10 flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full transition-colors"
              :title="t('proposals.editor.milestones.tooltip', 'Structure your proposal into milestone phases. When accepted, these auto-generate project milestones & tasks in your project workspace!')"
            >
              <Info class="h-3.5 w-3.5" />
            </span>

            <span
              v-if="milestoneSum > 0"
              class="ms-1 shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              {{ t('proposals.editor.milestones.sum', 'Sum:') }} ${{ milestoneSum.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Milestone Count Quick Selector + Add Button (Placed side-by-side) -->
      <div v-if="!isViewingPast" class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-ink text-xs font-semibold hidden sm:inline">{{ t('proposals.editor.milestones.countLabel', 'Number of Milestones:') }}</span>
          <div
            class="bg-canvas border-border flex items-center gap-1 rounded-xl border p-1 text-xs"
          >
            <button
              v-for="cnt in [1, 2, 3, 4, 5]"
              :key="cnt"
              type="button"
              class="h-7 w-7 rounded-lg font-bold transition-all"
              :class="
                localMilestones.length === cnt
                  ? 'bg-accent text-accent-contrast shadow-sm'
                  : 'text-muted hover:text-ink'
              "
              @click="promptSetMilestonesCount(cnt)"
            >
              {{ cnt }}
            </button>
            <button
              v-if="localMilestones.length > 5"
              type="button"
              class="bg-accent text-accent-contrast h-7 rounded-lg px-2 text-xs font-bold shadow-sm"
              :title="t('proposals.editor.milestones.activeCount', { count: localMilestones.length })"
            >
              {{ t('proposals.editor.milestones.activeCount', { count: localMilestones.length }) }}
            </button>
          </div>
        </div>

        <BaseButton size="sm" variant="secondary" @click="addMilestone">
          <Plus class="h-3.5 w-3.5" />
          <span>{{ t('proposals.editor.milestones.add', 'Add Milestone') }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="localMilestones.length === 0"
      class="border-border/80 bg-canvas flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed p-8 text-center"
    >
      <CheckSquare class="text-muted/50 h-8 w-8" />
      <div class="space-y-1">
        <p class="text-ink text-sm font-semibold">{{ t('proposals.editor.milestones.emptyTitle', 'No Milestones Defined Yet') }}</p>
        <p class="text-muted max-w-sm text-xs">
          {{ t('proposals.editor.milestones.emptyText', 'Break this proposal into clear milestone phases so your client knows exactly what deliverables to expect.') }}
        </p>
      </div>
      <BaseButton v-if="!isViewingPast" size="sm" @click="addMilestone">
        <Plus class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.milestones.createFirst', 'Create First Milestone') }}</span>
      </BaseButton>
    </div>

    <!-- Milestones List -->
    <div v-else class="space-y-5">
      <div
        v-for="(m, mIdx) in localMilestones"
        :key="m.id || mIdx"
        class="border-border bg-canvas group relative space-y-3 sm:space-y-4 rounded-xl border p-3 sm:p-5 shadow-xs"
      >
        <!-- Milestone Header Controls -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <BaseInput
              v-model="m.title"
              :label="t('proposals.editor.milestones.milestoneTitleLabel', 'Milestone Title')"
              :placeholder="t('proposals.editor.milestones.milestoneTitlePlaceholder', { num: mIdx + 1 })"
              :disabled="isViewingPast"
            />
          </div>

          <button
            v-if="!isViewingPast"
            type="button"
            class="text-muted hover:bg-canvas-muted mt-6 rounded-lg p-1.5 transition-colors hover:text-red-500"
            :title="t('proposals.editor.milestones.removeMilestone', 'Remove Milestone')"
            @click="promptRemoveMilestone(mIdx)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>

        <!-- Description & Amount Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <BaseInput
              v-model="m.description"
              :label="t('proposals.editor.milestones.phaseDescriptionLabel', 'Phase Description')"
              :placeholder="t('proposals.editor.milestones.phaseDescriptionPlaceholder', 'Describe deliverables and outcomes for this phase...')"
              :disabled="isViewingPast"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-ink">
              {{ t('proposals.editor.milestones.phaseBudgetLabel', 'Phase Budget ($)') }}
            </label>
            <input
              :value="m.amount"
              type="number"
              step="100"
              class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm font-bold text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
              placeholder="0.00"
              :disabled="isViewingPast"
              @input="m.amount = Number(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Deliverable Sub-Tasks List -->
        <div class="border-border/60 space-y-2 border-t pt-2">
          <div class="flex items-center justify-between">
            <span class="text-muted text-xs font-semibold tracking-wider uppercase">
              {{ t('proposals.editor.milestones.deliverablesTitle', 'Deliverables & Task Checklist') }}
            </span>
            <button
              v-if="!isViewingPast"
              type="button"
              class="text-accent flex items-center gap-1 text-xs font-semibold hover:underline"
              @click="addDeliverable(mIdx)"
            >
              <Plus class="h-3 w-3" />
              <span>{{ t('proposals.editor.milestones.addTaskItem', 'Add Task Item') }}</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(del, dIdx) in m.deliverables || []"
              :key="dIdx"
              class="flex items-center gap-2"
            >
              <CheckSquare class="text-accent h-4 w-4 shrink-0" />
              <input
                :value="del"
                type="text"
                class="border-border bg-canvas-elevated text-ink placeholder:text-muted/60 focus:border-accent flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
                :placeholder="t('proposals.editor.milestones.deliverablePlaceholder', 'e.g. High-fidelity Figma wireframes')"
                :readonly="isViewingPast"
                @input="
                  updateDeliverableText(mIdx, dIdx, ($event.target as HTMLInputElement).value)
                "
              />
              <button
                v-if="!isViewingPast"
                type="button"
                class="text-muted p-1 transition-colors hover:text-red-500"
                @click="promptRemoveDeliverable(mIdx, dIdx)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (No input field) -->
    <BaseModal
      :open="confirmModalOpen"
      :title="
        pendingDelete?.type === 'deliverable'
          ? t('proposals.editor.milestones.deleteDeliverableTitle', 'Delete Task Item')
          : t('proposals.editor.milestones.deleteMilestoneTitle', 'Delete Milestone')
      "
      @close="confirmModalOpen = false"
    >
      <div class="space-y-3 text-xs">
        <p class="text-muted leading-relaxed">
          <template v-if="pendingDelete?.type === 'deliverable'">
            {{ t('proposals.editor.milestones.deleteDeliverableConfirm', 'Are you sure you want to delete this task item? This action cannot be undone.') }}
          </template>
          <template v-else-if="pendingDelete?.type === 'milestoneCount'">
            {{ t('proposals.editor.milestones.deleteCountConfirm', 'Reducing the milestone count will remove trailing milestone(s). Are you sure you want to proceed?') }}
          </template>
          <template v-else>
            {{ t('proposals.editor.milestones.deleteMilestoneConfirm', 'Are you sure you want to delete this milestone and all its deliverables? This action cannot be undone.') }}
          </template>
        </p>
        <p v-if="pendingDelete?.title" class="font-semibold text-ink bg-canvas-muted p-2.5 rounded-lg border border-border">
          {{ pendingDelete.title }}
        </p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="confirmModalOpen = false">
          {{ t('common.actions.cancel', 'Cancel') }}
        </BaseButton>
        <BaseButton
          size="sm"
          class="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
          @click="handleConfirmDelete"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span>{{ t('common.actions.delete', 'Delete') }}</span>
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
