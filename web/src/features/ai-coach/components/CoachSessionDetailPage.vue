<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { stashOutreachInsert } from '@/features/outreach'
import {
  BaseButton,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useRegenerateSessionMutation, useSessionQuery } from '../queries'

const { t, te } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const sessionQuery = useSessionQuery(id)
const regenerate = useRegenerateSessionMutation()
const session = computed(() => sessionQuery.data.value)

const typeLabel = computed(() => {
  const key = `aiCoach.types.${session.value?.guidance_type || ''}`
  return te(key) ? t(key) : session.value?.guidance_type || ''
})

async function onRegenerate() {
  try {
    await regenerate.mutateAsync(id.value)
    toast.success('aiCoach.messages.regenerated')
    await sessionQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function insertIntoProposal() {
  if (!session.value?.response?.trim()) {
    toast.errorKey('aiCoach.insertEmpty')
    return
  }
  stashOutreachInsert({
    title: t('aiCoach.insertTitle', { type: typeLabel.value }),
    body: session.value.response,
    source: 'coach',
  })
  toast.success('aiCoach.insertReady')
  await router.push({ name: 'proposals', query: { fromOutreach: '1' } })
}

async function openInOutreach() {
  if (!session.value?.response?.trim()) {
    toast.errorKey('aiCoach.insertEmpty')
    return
  }
  stashOutreachInsert({
    title: t('aiCoach.insertTitle', { type: typeLabel.value }),
    body: session.value.response,
    source: 'coach',
  })
  toast.success('aiCoach.outreachReady')
  await router.push({ name: 'outreach', query: { tab: 'templates', fromCoach: '1' } })
}
</script>

<template>
  <section class="w-full space-y-6">
    <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'ai-coach' })">
      ← {{ t('aiCoach.back') }}
    </BaseButton>

    <LoadingState v-if="sessionQuery.isPending.value" />
    <ErrorState
      v-else-if="sessionQuery.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="sessionQuery.refetch()"
    />
    <EmptyState v-else-if="!session" :title="t('common.errors.notFound')" />

    <article v-else class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-muted">{{ typeLabel }}</p>
          <h1 class="font-display text-3xl text-ink">{{ t('aiCoach.sessionTitle') }}</h1>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="secondary"
            :loading="regenerate.isPending.value"
            @click="onRegenerate"
          >
            {{ t('aiCoach.regenerate') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="openInOutreach">
            {{ t('aiCoach.toOutreach') }}
          </BaseButton>
          <BaseButton @click="insertIntoProposal">
            {{ t('aiCoach.toProposal') }}
          </BaseButton>
        </div>
      </div>

      <section v-if="session.prompt" class="space-y-2">
        <h2 class="text-sm font-medium text-ink">{{ t('aiCoach.promptLabel') }}</h2>
        <p class="whitespace-pre-wrap rounded-lg border border-border bg-canvas-elevated p-4 text-sm text-ink-soft">
          {{ session.prompt }}
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-sm font-medium text-ink">{{ t('aiCoach.responseLabel') }}</h2>
        <p class="whitespace-pre-wrap rounded-lg border border-border bg-canvas-elevated p-4 text-ink">
          {{ session.response }}
        </p>
      </section>
    </article>
  </section>
</template>
