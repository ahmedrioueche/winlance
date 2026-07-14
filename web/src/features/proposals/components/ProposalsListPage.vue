<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  peekOutreachInsert,
  consumeOutreachInsert,
  type OutreachInsertPayload,
} from '@/features/outreach'
import { useLeadsQuery } from '@/features/leads'
import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreateProposalMutation,
  useProposalTemplatesQuery,
  useProposalsQuery,
  useUpdateProposalMutation,
} from '../queries'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const leadId = ref('')
const templateId = ref('')
const open = ref(false)
const insertOpen = ref(false)
const insertPayload = ref<OutreachInsertPayload | null>(null)
const selectedProposalId = ref('')
const mode = ref<'replace' | 'append'>('append')

const listParams = computed(() => ({ page: 1, page_size: 20 }))
const { data, isPending, isError, refetch } = useProposalsQuery(listParams)
const leadsQuery = useLeadsQuery(computed(() => ({ page: 1, page_size: 50 })))
const templatesQuery = useProposalTemplatesQuery()
const create = useCreateProposalMutation()
const update = useUpdateProposalMutation()

const proposals = computed(() => data.value?.results ?? [])
const proposalOptions = computed(() =>
  proposals.value.map((item) => ({
    value: String(item.id),
    label: item.title || String(item.id),
  })),
)
const leadOptions = computed(() =>
  (leadsQuery.data.value?.results ?? []).map((item) => ({
    value: String(item.id),
    label: item.title,
  })),
)
const templateOptions = computed(() => [
  { value: '', label: t('proposals.editor.defaultTemplate') },
  ...(templatesQuery.data.value ?? []).map((item) => ({
    value: String(item.id),
    label: item.name,
  })),
])
const modeOptions = computed(() => [
  { value: 'append', label: t('proposals.insert.append') },
  { value: 'replace', label: t('proposals.insert.replace') },
])

watch(
  () => route.query.fromOutreach,
  (value) => {
    if (value !== '1') return
    const payload = peekOutreachInsert()
    if (!payload) return
    insertPayload.value = payload
    insertOpen.value = true
    selectedProposalId.value = proposals.value[0] ? String(proposals.value[0].id) : ''
  },
  { immediate: true },
)

watch(proposals, (items) => {
  if (!selectedProposalId.value && items[0]) {
    selectedProposalId.value = String(items[0].id)
  }
})

async function submit() {
  try {
    const item = await create.mutateAsync({
      lead_id: Number(leadId.value),
      template_id: templateId.value || undefined,
      generate: true,
    })
    toast.success('proposals.messages.created')
    open.value = false
    leadId.value = ''
    templateId.value = ''
    await router.push({ name: 'proposal-detail', params: { id: item.id } })
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function closeInsert() {
  insertOpen.value = false
  insertPayload.value = null
  consumeOutreachInsert()
  if (route.query.fromOutreach) {
    const query = { ...route.query }
    delete query.fromOutreach
    await router.replace({ query })
  }
}

async function applyInsert() {
  if (!insertPayload.value || !selectedProposalId.value) return
  const target = proposals.value.find((item) => String(item.id) === selectedProposalId.value)
  if (!target) {
    toast.errorKey('proposals.insert.missingTarget')
    return
  }
  const nextBody =
    mode.value === 'replace'
      ? insertPayload.value.body
      : [target.body, insertPayload.value.body].filter(Boolean).join('\n\n')
  try {
    await update.mutateAsync({ id: selectedProposalId.value, body: nextBody })
    toast.success('proposals.insert.applied')
    const id = selectedProposalId.value
    await closeInsert()
    await router.push({ name: 'proposal-detail', params: { id } })
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl text-ink">{{ t('proposals.title') }}</h1>
        <p class="mt-2 text-muted">{{ t('proposals.subtitle') }}</p>
      </div>
      <BaseButton @click="open = true">{{ t('proposals.create') }}</BaseButton>
    </div>

    <LoadingState v-if="isPending" class="mt-6" />
    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <EmptyState v-else-if="!proposals.length" class="mt-6" :title="t('proposals.empty')" />
    <div v-else class="mt-6 space-y-3">
      <RouterLink
        v-for="item in proposals"
        :key="item.id"
        :to="`/app/proposals/${item.id}`"
        class="block rounded-lg border border-border bg-canvas-elevated p-4"
      >
        <p class="font-medium text-ink">{{ item.title }}</p>
        <p class="text-sm text-muted">{{ item.status }}</p>
      </RouterLink>
    </div>

    <BaseModal :open="open" :title="t('proposals.create')" @close="open = false">
      <div class="space-y-3">
        <BaseSelect
          v-if="leadOptions.length"
          v-model="leadId"
          :label="t('proposals.lead')"
          :options="leadOptions"
        />
        <BaseInput v-else v-model="leadId" :label="t('proposals.leadId')" />
        <BaseSelect
          v-model="templateId"
          :label="t('proposals.editor.template')"
          :options="templateOptions"
        />
      </div>
      <template #footer>
        <BaseButton :loading="Boolean(create.isPending)" @click="submit">
          {{ t('common.actions.create') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="insertOpen"
      :title="t('proposals.insert.title')"
      @close="closeInsert"
    >
      <div v-if="insertPayload" class="space-y-3">
        <p class="text-sm text-muted">
          {{ t('proposals.insert.from', { title: insertPayload.title }) }}
        </p>
        <pre
          class="max-h-40 overflow-auto rounded-md border border-border bg-canvas p-3 text-xs whitespace-pre-wrap text-ink"
          >{{ insertPayload.body }}</pre
        >
        <EmptyState
          v-if="!proposals.length"
          :title="t('proposals.insert.noProposals')"
          :description="t('proposals.insert.noProposalsHint')"
        />
        <template v-else>
          <BaseSelect
            v-model="selectedProposalId"
            :label="t('proposals.insert.target')"
            :options="proposalOptions"
          />
          <BaseSelect
            v-model="mode"
            :label="t('proposals.insert.mode')"
            :options="modeOptions"
          />
        </template>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeInsert">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton
          :disabled="!proposals.length || !selectedProposalId"
          :loading="Boolean(update.isPending)"
          @click="applyInsert"
        >
          {{ t('proposals.insert.apply') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
