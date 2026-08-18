<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import { useProposalsQuery } from '@/features/proposals'
import {
  BaseButton,
  BaseInput,
  BaseModal,
  BasePageHeader,
  BaseSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useContractTemplatesQuery,
  useContractsQuery,
  useCreateContractMutation,
} from '../queries'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const proposalId = ref('')
const templateId = ref('')
const open = ref(false)

const { data, isPending, isError, refetch } = useContractsQuery(
  computed(() => ({ page: 1, page_size: 20 })),
)
const proposalsQuery = useProposalsQuery(computed(() => ({ page: 1, page_size: 50 })))
const templatesQuery = useContractTemplatesQuery()
const create = useCreateContractMutation()

const contracts = computed(() => data.value?.results ?? [])
const proposalOptions = computed(() =>
  (proposalsQuery.data.value?.results ?? []).map((item) => ({
    value: String(item.id),
    label: item.title,
  })),
)
const templateOptions = computed(() => [
  { value: '', label: t('contracts.editor.defaultTemplate') },
  ...(templatesQuery.data.value ?? []).map((item) => ({
    value: String(item.id),
    label: item.name,
  })),
])

async function submit() {
  try {
    const item = await create.mutateAsync({
      proposal_id: proposalId.value,
      template_id: templateId.value || undefined,
      generate: true,
    })
    toast.success('contracts.messages.created')
    open.value = false
    proposalId.value = ''
    templateId.value = ''
    await router.push({ name: 'contract-detail', params: { id: item.id } })
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full">
    <BasePageHeader
      :title="t('contracts.title')"
      :subtitle="t('contracts.subtitle')"
    >
      <template #actions>
        <BaseButton @click="open = true">{{ t('contracts.create') }}</BaseButton>
      </template>
    </BasePageHeader>

    <LoadingState v-if="isPending" class="mt-8" />
    <ErrorState
      v-else-if="isError"
      class="mt-8"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <EmptyState v-else-if="!contracts.length" class="mt-8" :title="t('contracts.empty')" />
    <div v-else class="mt-8 space-y-3">
      <RouterLink
        v-for="item in contracts"
        :key="item.id"
        :to="`/app/contracts/${item.id}`"
        class="block rounded-lg border border-border bg-canvas-elevated p-4"
      >
        <p class="font-medium text-ink">{{ item.title }}</p>
        <p class="text-sm text-muted">{{ item.status }}</p>
      </RouterLink>
    </div>

    <BaseModal :open="open" :title="t('contracts.create')" @close="open = false">
      <div class="space-y-3">
        <BaseSelect
          v-if="proposalOptions.length"
          v-model="proposalId"
          :label="t('contracts.proposal')"
          :options="proposalOptions"
        />
        <BaseInput v-else v-model="proposalId" :label="t('contracts.proposalId')" required />
        <BaseSelect
          v-model="templateId"
          :label="t('contracts.editor.template')"
          :options="templateOptions"
        />
      </div>
      <template #footer>
        <BaseButton :loading="create.isPending.value" @click="submit">
          {{ t('common.actions.create') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
