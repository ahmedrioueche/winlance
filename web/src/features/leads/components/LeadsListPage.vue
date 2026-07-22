<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { Pagination } from '@/shared/components/composite'
import { usePagination } from '@/shared/composables/usePagination'
import { useToast } from '@/shared/toast/useToast'

import { LEAD_STATUSES } from '../types'
import { useCreateLeadMutation, useDeleteLeadMutation, useLeadsQuery } from '../queries'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { page, pageSize, setPage } = usePagination()

const q = ref(String(route.query.q ?? ''))
const status = ref(String(route.query.status ?? ''))

const params = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  q: q.value || undefined,
  status: status.value || undefined,
}))

const { data, isPending, isError, refetch } = useLeadsQuery(params)
const { mutateAsync: createLeadMutate, isPending: createPending } = useCreateLeadMutation()
const { mutateAsync: deleteLeadMutate, isPending: deletePending } = useDeleteLeadMutation()

const createOpen = ref(false)
const newTitle = ref('')
const confirmDeleteId = ref<number | null>(null)

const statusOptions = [
  { value: '', label: t('leads.filters.allStatuses') },
  ...LEAD_STATUSES.map((value) => ({ value, label: t(`leads.status.${value}`) })),
]

watch([q, status], () => {
  setPage(1)
  void router.replace({
    query: {
      ...route.query,
      q: q.value || undefined,
      status: status.value || undefined,
      page: undefined,
    },
  })
})

async function createLead() {
  try {
    const lead = await createLeadMutate({ title: newTitle.value })
    createOpen.value = false
    newTitle.value = ''
    toast.success('leads.messages.created')
    await router.push({ name: 'lead-detail', params: { id: String(lead.id) } })
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function confirmDelete() {
  if (confirmDeleteId.value == null) return
  try {
    await deleteLeadMutate(confirmDeleteId.value)
    confirmDeleteId.value = null
    toast.success('leads.messages.deleted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-ink">{{ t('leads.list.title') }}</h1>
        <p class="mt-2 text-muted">{{ t('leads.list.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <RouterLink to="/app/leads/pipeline">
          <BaseButton variant="secondary">{{ t('leads.list.pipeline') }}</BaseButton>
        </RouterLink>
        <BaseButton @click="createOpen = true">{{ t('leads.list.create') }}</BaseButton>
      </div>
    </div>

    <div class="mt-6 grid gap-3 md:grid-cols-[1fr_12rem]">
      <BaseInput v-model="q" :label="t('leads.filters.search')" />
      <BaseSelect v-model="status" :label="t('leads.filters.status')" :options="statusOptions" />
    </div>

    <LoadingState v-if="isPending" class="mt-8" :label="t('common.loading.content')" />
    <ErrorState
      v-else-if="isError"
      class="mt-8"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <EmptyState
      v-else-if="!data?.results.length"
      class="mt-8"
      :title="t('leads.list.emptyTitle')"
      :description="t('leads.list.emptyDescription')"
    >
      <template #action>
        <BaseButton @click="createOpen = true">{{ t('leads.list.create') }}</BaseButton>
      </template>
    </EmptyState>
    <div v-else class="mt-8 space-y-3">
      <article
        v-for="lead in data.results"
        :key="lead.id"
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas-elevated p-4 shadow-soft"
      >
        <div>
          <RouterLink class="font-medium text-ink hover:underline" :to="`/app/leads/${lead.id}`">
            {{ lead.title }}
          </RouterLink>
          <p class="text-sm text-muted">
            {{ t(`leads.status.${lead.status}`) }} · {{ t('leads.list.score', { score: lead.score }) }}
          </p>
        </div>
        <BaseButton variant="ghost" size="sm" @click="confirmDeleteId = lead.id">
          {{ t('common.actions.delete') }}
        </BaseButton>
      </article>
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="data.count"
        @update:page="setPage"
      />
    </div>

    <BaseModal :open="createOpen" :title="t('leads.create.title')" @close="createOpen = false">
      <BaseInput v-model="newTitle" :label="t('leads.create.titleLabel')" required />
      <template #footer>
        <BaseButton variant="secondary" @click="createOpen = false">{{ t('common.actions.cancel') }}</BaseButton>
        <BaseButton :loading="createPending" @click="createLead">
          {{ t('leads.create.submit') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="confirmDeleteId != null"
      :title="t('leads.delete.title')"
      @close="confirmDeleteId = null"
    >
      <p>{{ t('leads.delete.message') }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="confirmDeleteId = null">{{ t('common.actions.cancel') }}</BaseButton>
        <BaseButton :loading="deletePending" @click="confirmDelete">
          {{ t('leads.delete.confirm') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
