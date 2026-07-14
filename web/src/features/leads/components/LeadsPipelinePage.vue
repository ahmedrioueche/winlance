<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton, EmptyState, ErrorState, LoadingState } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { LEAD_STATUSES } from '../types'
import { usePipelineQuery, useTransitionLeadMutation } from '../queries'

const { t } = useI18n()
const toast = useToast()
const { data, isPending, isError, refetch } = usePipelineQuery()
const transition = useTransitionLeadMutation()

async function move(id: number, status: (typeof LEAD_STATUSES)[number]) {
  try {
    await transition.mutateAsync({ id, status })
    toast.success('leads.messages.transitioned')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-3xl text-ink">{{ t('leads.pipeline.title') }}</h1>
      <RouterLink to="/app/leads">
        <BaseButton variant="secondary">{{ t('leads.pipeline.backToList') }}</BaseButton>
      </RouterLink>
    </div>

    <LoadingState v-if="isPending" class="mt-8" />
    <ErrorState
      v-else-if="isError"
      class="mt-8"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <div v-else class="mt-8 flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="status in LEAD_STATUSES"
        :key="status"
        class="min-w-[16rem] flex-1 rounded-lg border border-border bg-canvas-elevated p-3"
      >
        <h2 class="mb-3 text-sm font-semibold text-ink">{{ t(`leads.status.${status}`) }}</h2>
        <EmptyState
          v-if="!(data?.[status]?.length)"
          :title="t('leads.pipeline.emptyColumn')"
          class="!py-6"
        />
        <ul v-else class="space-y-2">
          <li
            v-for="lead in data?.[status] ?? []"
            :key="lead.id"
            class="rounded-md border border-border bg-canvas p-3"
          >
            <RouterLink class="font-medium text-ink hover:underline" :to="`/app/leads/${lead.id}`">
              {{ lead.title }}
            </RouterLink>
            <div class="mt-2 flex flex-wrap gap-1">
              <BaseButton
                v-for="next in LEAD_STATUSES.filter((s) => s !== status).slice(0, 2)"
                :key="next"
                size="sm"
                variant="ghost"
                @click="move(lead.id, next)"
              >
                → {{ t(`leads.status.${next}`) }}
              </BaseButton>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
