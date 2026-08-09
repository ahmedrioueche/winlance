<script setup lang="ts">
import { computed } from 'vue'
import { BaseInput, BaseSelect } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { Proposal } from '@/features/proposals/types'

interface Props {
  proposals: Proposal[]
}

const props = defineProps<Props>()

const title = defineModel<string>('title', { default: '' })
const clientName = defineModel<string>('clientName', { default: '' })
const clientEmail = defineModel<string>('clientEmail', { default: '' })
const proposalId = defineModel<string>('proposalId', { default: '' })

const proposalOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [{ value: '', label: 'None (Standalone Project)' }]
  props.proposals.forEach((p) => {
    opts.push({
      value: p.id,
      label: `${p.title} (${p.amount ? `$${Number(p.amount).toLocaleString()}` : 'Draft'})`,
    })
  })
  return opts
})
</script>

<template>
  <div class="space-y-4 text-xs">
    <BaseInput
      v-model="title"
      label="Project Workspace Title"
      placeholder="e.g. Rookie Corp ERP Implementation"
      required
    />

    <BaseSelect
      v-model="proposalId"
      label="Link Proposal (Optional)"
      :options="proposalOptions"
    />

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseInput
        v-model="clientName"
        label="Client / Entity Name"
        placeholder="e.g. Sarah Jenkins"
      />

      <BaseInput
        v-model="clientEmail"
        type="email"
        label="Client Contact Email"
        placeholder="e.g. contact@rookiecorp.com"
      />
    </div>
  </div>
</template>
