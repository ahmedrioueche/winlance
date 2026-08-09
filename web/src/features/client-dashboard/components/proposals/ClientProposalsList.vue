<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import type { ClientProposal } from '../../types'
import ClientProposalCard from './ClientProposalCard.vue'

interface Props {
  proposals: ClientProposal[]
}

defineProps<Props>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search proposals..."
        class="w-full rounded-xl border border-border bg-canvas-elevated py-2 pr-4 pl-9 text-xs text-ink placeholder:text-muted/60 shadow-xs focus:border-accent focus:outline-none"
      />
    </div>

    <div v-if="proposals.length === 0" class="rounded-2xl border border-border bg-canvas-elevated p-12 text-center text-xs text-muted">
      {{ t('clients.proposals.noProposals') }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ClientProposalCard
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
      />
    </div>
  </div>
</template>
