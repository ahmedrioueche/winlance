<script setup lang="ts">
import { Edit3, Eye, FileText, Trash2 } from 'lucide-vue-next'
import type { Proposal } from '../../types'

interface Props {
  proposal: Proposal
}

defineProps<Props>()

defineEmits<{
  delete: []
}>()
</script>

<template>
  <tr class="group hover:bg-canvas-muted/50 transition">
    <td class="px-4 py-3 font-semibold text-ink">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-500 shrink-0">
          <FileText class="h-4 w-4" />
        </div>
        <span class="truncate max-w-xs">{{ proposal.title }}</span>
      </div>
    </td>

    <td class="px-4 py-3">
      <span
        class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
        :class="proposal.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'"
      >
        {{ proposal.status }}
      </span>
    </td>

    <td class="px-4 py-3 font-semibold text-ink">
      ${{ Number(proposal.amount || 0).toLocaleString() }} {{ proposal.currency }}
    </td>

    <td class="px-4 py-3 text-end">
      <div class="flex items-center justify-end gap-1">
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted hover:bg-canvas-muted hover:text-accent transition"
          title="Open Proposal Details"
          @click="$router.push(`/app/proposals/${proposal.id}`)"
        >
          <Eye class="h-4 w-4" />
        </button>

        <button
          type="button"
          class="rounded-lg p-1.5 text-muted hover:bg-canvas-muted hover:text-accent transition"
          title="Edit Proposal"
          @click="$router.push(`/app/proposals/${proposal.id}/edit`)"
        >
          <Edit3 class="h-4 w-4" />
        </button>

        <button
          type="button"
          class="rounded-lg p-1.5 text-muted hover:bg-canvas-muted hover:text-error transition"
          title="Delete Proposal"
          @click="$emit('delete')"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
</template>
