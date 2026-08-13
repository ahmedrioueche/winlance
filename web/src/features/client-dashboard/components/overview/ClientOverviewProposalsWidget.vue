<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FileText } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { ClientProposal } from '../../types'

interface Props {
  proposals: ClientProposal[]
  clientId: string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
    <div class="flex items-center justify-between border-b border-border/60 pb-3">
      <div>
        <h2 class="font-display text-base font-bold text-ink">{{ t('clients.overview.proposalsTitle') }}</h2>
        <p class="text-xs text-muted">Sent estimates, proposals, and acceptance status</p>
      </div>
      <BaseButton variant="secondary" size="sm" @click="$router.push(`/app/clients/${clientId}/proposals`)">
        {{ t('clients.overview.viewAll') }}
      </BaseButton>
    </div>

    <div v-if="proposals.length === 0" class="text-xs text-muted text-center py-8">
      {{ t('clients.overview.noProposals') }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="prop in proposals"
        :key="prop.id"
        class="rounded-xl border border-border/80 bg-canvas p-4 text-xs flex items-center justify-between gap-4 cursor-pointer hover:border-accent/40 transition"
        @click="$router.push(`/app/clients/${clientId}/proposals/${prop.id}`)"
      >
        <div class="flex items-center gap-3 truncate">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-500 shrink-0">
            <FileText class="h-4 w-4" />
          </div>
          <div class="truncate">
            <h3 class="font-bold text-ink truncate">{{ prop.title }}</h3>
            <p v-if="prop.amount" class="text-muted text-[11px] truncate">${{ Number(prop.amount).toLocaleString() }} USD</p>
          </div>
        </div>
        <span
          class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase shrink-0"
          :class="prop.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'"
        >
          {{ prop.status }}
        </span>
      </div>
    </div>
  </div>
</template>
