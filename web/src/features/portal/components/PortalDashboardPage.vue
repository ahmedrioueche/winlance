<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { isApiError } from '@/shared/types/api'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreatePortalRequirementMutation,
  usePortalActionMutation,
  usePortalQuery,
} from '../queries'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const token = computed(() => String(route.params.token))

const portalQuery = usePortalQuery(token)
const create = useCreatePortalRequirementMutation()
const action = usePortalActionMutation()

const title = ref('')
const description = ref('')

const dashboard = computed(() => portalQuery.data.value)
const isExpired = computed(() => {
  const error = portalQuery.error.value
  return isApiError(error) && (error.status === 404 || error.code === 'http_404')
})

const milestones = computed(() => dashboard.value?.progress?.milestones ?? [])
const reports = computed(() => dashboard.value?.reports ?? [])
const files = computed(() => dashboard.value?.files ?? [])
const progressPercent = computed(() => dashboard.value?.progress?.percent ?? 0)

async function add() {
  try {
    await create.mutateAsync({
      token: token.value,
      title: title.value,
      description: description.value,
    })
    title.value = ''
    description.value = ''
    toast.success('portal.messages.requirementAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function accept(kind: 'accept-offer' | 'accept-contract') {
  try {
    await action.mutateAsync({ token: token.value, action: kind })
    toast.success('portal.messages.accepted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <main class="mx-auto min-h-dvh w-full max-w-4xl p-6 md:p-8">
    <LoadingState v-if="portalQuery.isPending.value" />
    <EmptyState
      v-else-if="isExpired"
      :title="t('portal.expiredTitle')"
      :description="t('portal.expiredMessage')"
    />
    <ErrorState
      v-else-if="portalQuery.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="portalQuery.refetch()"
    />
    <EmptyState v-else-if="!dashboard" :title="t('common.errors.notFound')" />

    <div v-else class="space-y-8 sm:space-y-10">
      <header class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft sm:p-8">
        <p class="text-xs font-medium tracking-[0.18em] text-muted uppercase sm:text-sm">
          {{ t('portal.badge') }}
        </p>
        <h1 class="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {{ dashboard.project.title }}
        </h1>
        <p class="mt-3 text-base text-ink-soft sm:text-lg">{{ dashboard.project.summary }}</p>
      </header>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.requirements') }}</h2>
        <EmptyState
          v-if="!dashboard.requirements?.length"
          :title="t('portal.emptyRequirements')"
        />
        <article
          v-for="item in dashboard.requirements"
          :key="item.id"
          class="rounded-lg border border-border bg-canvas-elevated p-4 sm:p-5"
        >
          <h3 class="font-medium text-ink">{{ item.title }}</h3>
          <p class="mt-1 text-sm text-ink-soft">{{ item.description }}</p>
        </article>
        <div class="space-y-3 rounded-lg border border-dashed border-border p-4 sm:p-5">
          <BaseInput v-model="title" :label="t('portal.requirementTitle')" />
          <BaseTextarea v-model="description" :label="t('portal.requirementDescription')" />
          <BaseButton class="w-full sm:w-auto" :loading="create.isPending.value" @click="add">
            {{ t('portal.addRequirement') }}
          </BaseButton>
        </div>
      </section>

      <section v-if="dashboard.offer" class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.offer') }}</h2>
        <div
          class="rounded-lg border border-border bg-canvas-elevated p-4 whitespace-pre-wrap text-ink-soft sm:p-5"
        >
          {{ dashboard.offer.body }}
        </div>
        <BaseButton
          class="w-full sm:w-auto"
          :loading="action.isPending.value"
          @click="accept('accept-offer')"
        >
          {{ t('portal.acceptOffer') }}
        </BaseButton>
      </section>

      <section v-if="dashboard.contract" class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.contract') }}</h2>
        <div
          class="rounded-lg border border-border bg-canvas-elevated p-4 whitespace-pre-wrap text-ink-soft sm:p-5"
        >
          {{ dashboard.contract.body }}
        </div>
        <BaseButton
          class="w-full sm:w-auto"
          :loading="action.isPending.value"
          @click="accept('accept-contract')"
        >
          {{ t('portal.acceptContract') }}
        </BaseButton>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.progress') }}</h2>
        <p class="text-sm font-medium text-ink">
          {{ t('portal.progressPercent', { percent: progressPercent }) }}
        </p>
        <div class="h-2 overflow-hidden rounded-full bg-border">
          <div
            class="h-full rounded-full bg-accent transition-[width] duration-300"
            :style="{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }"
          />
        </div>
        <EmptyState v-if="!milestones.length" :title="t('portal.emptyMilestones')" />
        <ul v-else class="space-y-2">
          <li
            v-for="item in milestones"
            :key="item.id"
            class="rounded-lg border border-border bg-canvas-elevated px-3 py-3 sm:px-4"
          >
            <p class="font-medium text-ink">{{ item.title }}</p>
            <p class="text-sm text-muted">
              {{ item.status }} · {{ item.progress_percent }}%
            </p>
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.reports') }}</h2>
        <EmptyState v-if="!reports.length" :title="t('portal.emptyReports')" />
        <article
          v-for="report in reports"
          :key="report.id"
          class="rounded-lg border border-border bg-canvas-elevated p-4 sm:p-5"
        >
          <h3 class="font-medium text-ink">{{ report.title }}</h3>
          <p class="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{{ report.body }}</p>
        </article>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink sm:text-2xl">{{ t('portal.files') }}</h2>
        <EmptyState v-if="!files.length" :title="t('portal.emptyFiles')" />
        <ul v-else class="space-y-2">
          <li
            v-for="file in files"
            :key="file.id"
            class="rounded-lg border border-border bg-canvas-elevated px-3 py-3 text-sm sm:px-4"
          >
            <a
              v-if="file.url"
              class="font-medium text-ink underline-offset-2 hover:underline"
              :href="file.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ file.name }}
            </a>
            <span v-else class="font-medium text-ink">{{ file.name }}</span>
            <p v-if="file.notes" class="text-muted">{{ file.notes }}</p>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
