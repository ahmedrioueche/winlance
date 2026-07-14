<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { EmptyState, ErrorState, LoadingState } from '@/shared/components/base'

import { usePlaybookQuery, useSequencesQuery } from '../queries'

const { t } = useI18n()
const sequencesQuery = useSequencesQuery()
const playbookQuery = usePlaybookQuery()
const sequences = computed(() => sequencesQuery.data.value ?? [])
const playbook = computed(() => playbookQuery.data.value)
</script>

<template>
  <section class="space-y-6">
    <div>
      <h2 class="font-display text-xl text-ink">{{ t('outreach.sequences.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('outreach.sequences.subtitle') }}</p>
    </div>

    <div
      v-if="playbook"
      class="grid gap-3 rounded-lg border border-border bg-canvas-elevated p-4 sm:grid-cols-3"
    >
      <p class="text-sm text-ink">
        {{ t('outreach.playbook.templates', { count: playbook.templates }) }}
      </p>
      <p class="text-sm text-ink">
        {{ t('outreach.playbook.sequences', { count: playbook.sequences }) }}
      </p>
      <p class="text-sm text-ink">
        {{ t('outreach.playbook.checklists', { count: playbook.checklists }) }}
      </p>
    </div>

    <LoadingState v-if="sequencesQuery.isPending" />
    <ErrorState
      v-else-if="sequencesQuery.isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="sequencesQuery.refetch()"
    />
    <EmptyState v-else-if="!sequences.length" :title="t('outreach.sequences.empty')" />
    <ul v-else class="space-y-3">
      <li
        v-for="sequence in sequences"
        :key="sequence.id"
        class="rounded-lg border border-border bg-canvas-elevated p-4"
      >
        <h3 class="font-medium text-ink">{{ sequence.title }}</h3>
        <p class="mt-1 text-sm text-ink-soft">{{ sequence.description }}</p>
        <ol v-if="sequence.steps?.length" class="mt-3 space-y-2 text-sm text-muted">
          <li v-for="step in sequence.steps" :key="step.id">
            {{ t('outreach.sequences.step', { n: step.step_number, days: step.delay_days }) }}
            —
            {{ step.template_detail?.title || t('outreach.sequences.templateFallback') }}
          </li>
        </ol>
      </li>
    </ul>
  </section>
</template>
