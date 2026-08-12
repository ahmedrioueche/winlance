<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, DollarSign, FileCheck } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposal?: Proposal
  isAccepted: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  signProposal: []
}>()

const { t } = useI18n()
const isVisible = ref(false)

function handleScroll() {
  // Show sticky bar when scrolled past 180px
  isVisible.value = window.scrollY > 180
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-canvas-elevated/95 p-3 shadow-lg backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4">
        <!-- Proposal Title & Investment Badge -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="truncate">
            <h4 class="font-display text-xs sm:text-sm font-bold text-ink truncate max-w-xs sm:max-w-md">
              {{ proposal?.title || 'Project Proposal Offer' }}
            </h4>
            <p class="text-[11px] text-muted hidden sm:block">
              VIP Client Portal Review
            </p>
          </div>

          <div v-if="proposal?.amount" class="hidden md:flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
            <DollarSign class="h-3.5 w-3.5" />
            <span>${{ Number(proposal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ proposal.currency || 'USD' }}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex items-center gap-2 shrink-0">
          <BaseButton v-if="!isAccepted" size="sm" class="shadow-sm" @click="emit('signProposal')">
            <FileCheck class="h-4 w-4" />
            <span>{{ t('portal.signProposal', 'Sign & Accept Proposal') }}</span>
          </BaseButton>

          <div v-else class="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="h-4 w-4" />
            <span>Signed &amp; Accepted</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
