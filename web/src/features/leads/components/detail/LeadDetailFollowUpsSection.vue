<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, EmptyState } from '@/shared/components/base'
import type { FollowUp } from '../../types'

interface Props {
  followUps?: FollowUp[]
  createFollowUpPending: boolean
  completeFollowUpPending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  addFollowUp: []
  markComplete: [id: number]
}>()

const followUpAt = defineModel<string>('followUpAt', { default: '' })
const followUpNotes = defineModel<string>('followUpNotes', { default: '' })

const { t } = useI18n()

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-xl text-ink">{{ t('leads.followUps.title') }}</h2>
    <EmptyState v-if="!followUps?.length" :title="t('leads.followUps.empty')" />
    <ul v-else class="space-y-2">
      <li
        v-for="item in followUps"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm"
      >
        <div>
          <p class="font-medium text-ink">
            {{ formatWhen(item.scheduled_at) }}
            <span v-if="item.completed" class="text-success">
              · {{ t('leads.followUps.done') }}
            </span>
          </p>
          <p class="text-muted">{{ item.notes }}</p>
        </div>
        <BaseButton
          v-if="!item.completed"
          size="sm"
          variant="secondary"
          :loading="completeFollowUpPending"
          @click="emit('markComplete', item.id)"
        >
          {{ t('leads.followUps.complete') }}
        </BaseButton>
      </li>
    </ul>

    <div class="grid gap-3 sm:grid-cols-2">
      <BaseInput
        v-model="followUpAt"
        :label="t('leads.followUps.when')"
        type="datetime-local"
      />
      <BaseInput v-model="followUpNotes" :label="t('leads.followUps.notes')" />
    </div>
    <BaseButton :loading="createFollowUpPending" @click="emit('addFollowUp')">
      {{ t('leads.followUps.add') }}
    </BaseButton>
  </section>
</template>
