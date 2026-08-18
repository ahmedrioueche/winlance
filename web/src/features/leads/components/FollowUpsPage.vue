<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import {
  BaseButton,
  BasePageHeader,
  BaseSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useCompleteFollowUpMutation, useFollowUpsQuery } from '../queries'

const { t } = useI18n()
const toast = useToast()
const filter = ref('overdue')
const params = computed(() => {
  if (filter.value === 'upcoming') return { upcoming: true }
  if (filter.value === 'completed') return { completed: true }
  return { overdue: true }
})

const query = useFollowUpsQuery(params)
const complete = useCompleteFollowUpMutation()
const items = computed(() => query.data.value?.results ?? [])

const filterOptions = [
  { value: 'overdue', label: t('leads.followUps.filterOverdue') },
  { value: 'upcoming', label: t('leads.followUps.filterUpcoming') },
  { value: 'completed', label: t('leads.followUps.filterCompleted') },
]

async function markComplete(id: number) {
  try {
    await complete.mutateAsync({ id })
    toast.success('leads.messages.followUpCompleted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <section class="w-full space-y-6">
    <BasePageHeader
      :title="t('leads.followUps.pageTitle')"
      :subtitle="t('leads.followUps.pageSubtitle')"
    >
      <template #actions>
        <BaseSelect v-model="filter" :label="t('leads.followUps.filter')" :options="filterOptions" />
      </template>
    </BasePageHeader>

    <LoadingState v-if="query.isPending.value" />
    <ErrorState
      v-else-if="query.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="query.refetch()"
    />
    <EmptyState v-else-if="!items.length" :title="t('leads.followUps.emptyFilter')" />
    <ul v-else class="space-y-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas-elevated px-4 py-3"
      >
        <div>
          <p class="font-medium text-ink">{{ formatWhen(item.scheduled_at) }}</p>
          <p class="text-sm text-muted">{{ item.notes || t('leads.followUps.noNotes') }}</p>
          <RouterLink class="text-sm text-accent underline-offset-2 hover:underline" :to="`/app/leads/${item.lead}`">
            {{ t('leads.followUps.openLead') }}
          </RouterLink>
        </div>
        <BaseButton
          v-if="!item.completed"
          size="sm"
          variant="secondary"
          :loading="complete.isPending.value"
          @click="markComplete(item.id)"
        >
          {{ t('leads.followUps.complete') }}
        </BaseButton>
      </li>
    </ul>
  </section>
</template>
