<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useProjectsQuery } from '@/features/projects'
import {
  BaseButton,
  BaseInput,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useStatusPolling } from '@/shared/composables/useStatusPolling'
import { useToast } from '@/shared/toast/useToast'

import {
  useContractActionMutation,
  useContractQuery,
  useContractTemplatesQuery,
  useUpdateContractMutation,
} from '../queries'

const { t, te } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const contractQuery = useContractQuery(id)
const templatesQuery = useContractTemplatesQuery()
const projectsQuery = useProjectsQuery(computed(() => ({ page: 1, page_size: 50 })))
const action = useContractActionMutation()
const update = useUpdateContractMutation()

const contract = computed(() => contractQuery.data.value)
const status = computed(() => contract.value?.status)
const isGenerating = computed(() => status.value === 'GENERATING')
const statusLabel = computed(() => {
  const key = `contracts.status.${status.value || ''}`
  return te(key) ? t(key) : status.value || ''
})

useStatusPolling(status, () => contractQuery.refetch())

const title = ref('')
const body = ref('')
const templateId = ref('')
const projectId = ref('')
const dirty = ref(false)
const hydrating = ref(false)

watch(
  contract,
  async (value, previous) => {
    if (!value) return
    const finishedGenerating =
      previous?.status === 'GENERATING' && value.status !== 'GENERATING'
    if (dirty.value && !finishedGenerating) return
    hydrating.value = true
    title.value = value.title
    body.value = value.body
    templateId.value = value.template ? String(value.template) : ''
    projectId.value = value.project_id ? String(value.project_id) : ''
    if (finishedGenerating) dirty.value = false
    await nextTick()
    hydrating.value = false
  },
  { immediate: true },
)

watch([title, body, templateId, projectId], () => {
  if (!hydrating.value && contract.value) dirty.value = true
})

const templateOptions = computed(() => [
  { value: '', label: t('contracts.editor.defaultTemplate') },
  ...(templatesQuery.data.value ?? []).map((item) => ({
    value: String(item.id),
    label: item.is_default
      ? t('contracts.editor.templateDefault', { name: item.name })
      : item.name,
  })),
])

const projectOptions = computed(() => [
  { value: '', label: t('contracts.editor.noProject') },
  ...(projectsQuery.data.value?.results ?? []).map((item) => ({
    value: String(item.id),
    label: item.title,
  })),
])

async function save() {
  try {
    await update.mutateAsync({
      id: id.value,
      title: title.value,
      body: body.value,
      template: templateId.value || null,
      project_id: projectId.value || null,
    })
    dirty.value = false
    toast.success('contracts.messages.saved')
    await contractQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function act(kind: 'generate' | 'export' | 'send' | 'sign') {
  try {
    if (dirty.value && kind === 'generate') await save()
    await action.mutateAsync({ id: id.value, action: kind })
    toast.success(`contracts.messages.${kind}d`)
    await contractQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-6">
    <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'contracts' })">
      ← {{ t('contracts.editor.back') }}
    </BaseButton>

    <LoadingState v-if="contractQuery.isPending.value" />
    <ErrorState
      v-else-if="contractQuery.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="contractQuery.refetch()"
    />
    <EmptyState v-else-if="!contract" :title="t('common.errors.notFound')" />

    <article v-else class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-muted">{{ statusLabel }}</p>
          <h1 class="font-display text-3xl text-ink">{{ contract.title }}</h1>
          <p v-if="contract.signed_at" class="mt-1 text-xs text-muted">
            {{ t('contracts.editor.signedAt', { date: new Date(contract.signed_at).toLocaleString() }) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="secondary"
            :loading="update.isPending.value"
            :disabled="isGenerating"
            @click="save"
          >
            {{ t('common.actions.save') }}
          </BaseButton>
          <BaseButton
            v-for="kind in (['generate', 'export', 'send', 'sign'] as const)"
            :key="kind"
            :loading="action.isPending.value || (kind === 'generate' && isGenerating)"
            :disabled="isGenerating && kind !== 'generate'"
            @click="act(kind)"
          >
            {{ t(`contracts.${kind}`) }}
          </BaseButton>
        </div>
      </div>

      <div
        v-if="isGenerating"
        class="rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm text-ink"
        role="status"
      >
        {{ t('contracts.editor.generating') }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseSelect
          v-model="templateId"
          :label="t('contracts.editor.template')"
          :options="templateOptions"
          :disabled="isGenerating"
        />
        <BaseSelect
          v-model="projectId"
          :label="t('contracts.editor.project')"
          :options="projectOptions"
          :disabled="isGenerating"
        />
      </div>

      <BaseInput
        v-model="title"
        :label="t('contracts.editor.title')"
        :disabled="isGenerating"
      />
      <BaseTextarea
        v-model="body"
        :label="t('contracts.editor.body')"
        :rows="14"
        :disabled="isGenerating"
      />

      <section v-if="contract.export_content" class="space-y-2">
        <h2 class="font-display text-lg text-ink">{{ t('contracts.editor.export') }}</h2>
        <pre
          class="overflow-x-auto rounded-lg border border-border bg-canvas-elevated p-4 text-sm whitespace-pre-wrap text-ink-soft"
          >{{ contract.export_content }}</pre
        >
      </section>
    </article>
  </section>
</template>
