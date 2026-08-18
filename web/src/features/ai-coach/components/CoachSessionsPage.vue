<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import {
  BaseButton,
  BaseModal,
  BasePageHeader,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useCreateSessionMutation, useSessionsQuery } from '../queries'
import type { GuidanceType } from '../types'

const { t, te } = useI18n()
const toast = useToast()
const router = useRouter()
const open = ref(false)
const type = ref<GuidanceType>('GENERAL')
const prompt = ref('')
const { data, isPending, isError, refetch } = useSessionsQuery()
const create = useCreateSessionMutation()

const sessions = computed(() => data.value?.results ?? [])
const options = (['PRICING', 'NEGOTIATION', 'FOLLOW_UP', 'GENERAL'] as const).map((value) => ({
  value,
  label: t(`aiCoach.types.${value}`),
}))

function typeLabel(value: string) {
  const key = `aiCoach.types.${value}`
  return te(key) ? t(key) : value
}

async function submit() {
  try {
    const item = await create.mutateAsync({
      guidance_type: type.value,
      prompt: prompt.value,
      generate: true,
    })
    toast.success('aiCoach.messages.created')
    open.value = false
    prompt.value = ''
    await router.push({ name: 'ai-coach-detail', params: { id: item.id } })
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-6">
    <BasePageHeader
      :title="t('aiCoach.title')"
      :subtitle="t('aiCoach.subtitle')"
    >
      <template #actions>
        <BaseButton @click="open = true">{{ t('aiCoach.create') }}</BaseButton>
      </template>
    </BasePageHeader>

    <LoadingState v-if="isPending" />
    <ErrorState
      v-else-if="isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <EmptyState v-else-if="!sessions.length" :title="t('aiCoach.empty')" />
    <ul v-else class="space-y-3">
      <li v-for="item in sessions" :key="item.id">
        <RouterLink
          :to="`/app/ai-coach/${item.id}`"
          class="block rounded-lg border border-border bg-canvas-elevated p-4"
        >
          <p class="font-medium text-ink">{{ typeLabel(item.guidance_type) }}</p>
          <p class="mt-1 line-clamp-2 text-sm text-muted">
            {{ item.response || item.prompt || item.status }}
          </p>
        </RouterLink>
      </li>
    </ul>

    <BaseModal :open="open" :title="t('aiCoach.create')" @close="open = false">
      <div class="space-y-3">
        <BaseSelect v-model="type" :label="t('aiCoach.guidanceType')" :options="options" />
        <BaseTextarea v-model="prompt" :label="t('aiCoach.prompt')" :rows="4" />
      </div>
      <template #footer>
        <BaseButton :loading="create.isPending.value" @click="submit">
          {{ t('common.actions.create') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
