<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Proposal } from '../../types'
import ProposalsListRow from './ProposalsListRow.vue'

interface Props {
  proposals: Proposal[]
}

defineProps<Props>()

const emit = defineEmits<{
  delete: [proposal: Proposal]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border bg-canvas-elevated shadow-soft overflow-hidden">
    <div v-if="proposals.length === 0" class="p-12 text-center text-xs text-muted">
      {{ t('proposals.noProposalsFound', 'No proposals found') }}
    </div>

    <table v-else class="w-full text-left text-xs border-collapse">
      <thead>
        <tr class="border-b border-border bg-canvas-muted/40 text-muted font-medium">
          <th class="px-4 py-3">{{ t('proposals.table.title', 'Proposal Title') }}</th>
          <th class="px-4 py-3">{{ t('proposals.table.status', 'Status') }}</th>
          <th class="px-4 py-3">{{ t('proposals.table.amount', 'Investment Amount') }}</th>
          <th class="px-4 py-3 text-end">{{ t('proposals.table.actions', 'Actions') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60">
        <ProposalsListRow
          v-for="proposal in proposals"
          :key="proposal.id"
          :proposal="proposal"
          @delete="emit('delete', proposal)"
        />
      </tbody>
    </table>
  </div>
</template>
