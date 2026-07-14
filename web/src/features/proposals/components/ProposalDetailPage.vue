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
  useGenerateProposalMutation,
  useProposalQuery,
  useProposalTemplatesQuery,
  useSendProposalMutation,
  useUpdateProposalMutation,
} from '../queries'

const { t, te } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const proposalQuery = useProposalQuery(id)
const templatesQuery = useProposalTemplatesQuery()
const projectsQuery = useProjectsQuery(computed(() => ({ page: 1, page_size: 50 })))
const generate = useGenerateProposalMutation()
const send = useSendProposalMutation()
const update = useUpdateProposalMutation()

const proposal = computed(() => proposalQuery.data.value)
const status = computed(() => proposal.value?.status)
const isGenerating = computed(() => status.value === 'GENERATING')
const statusLabel = computed(() => {
  const key = `proposals.status.${status.value || ''}`
  return te(key) ? t(key) : status.value || ''
})

useStatusPolling(status, () => proposalQuery.refetch())

const title = ref('')
const summary = ref('')
const body = ref('')
const templateId = ref('')
const projectId = ref('')
const dirty = ref(false)
const hydrating = ref(false)

watch(
  proposal,
  async (value, previous) => {
    if (!value) return
    const finishedGenerating =
      previous?.status === 'GENERATING' && value.status !== 'GENERATING'
    if (dirty.value && !finishedGenerating) return
    hydrating.value = true
    title.value = value.title
    summary.value = value.summary
    body.value = value.body
    templateId.value = value.template ? String(value.template) : ''
    projectId.value = value.project_id ? String(value.project_id) : ''
    if (finishedGenerating) dirty.value = false
    await nextTick()
    hydrating.value = false
  },
  { immediate: true },
)

watch([title, summary, body, templateId, projectId], () => {
  if (!hydrating.value && proposal.value) dirty.value = true
})

const templateOptions = computed(() => [
  { value: '', label: t('proposals.editor.defaultTemplate') },
  ...(templatesQuery.data.value ?? []).map((item) => ({
    value: String(item.id),
    label: item.is_default
      ? t('proposals.editor.templateDefault', { name: item.name })
      : item.name,
  })),
])

const projectOptions = computed(() => [
  { value: '', label: t('proposals.editor.noProject') },
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
      summary: summary.value,
      body: body.value,
      template: templateId.value || null,
      project_id: projectId.value || null,
    })
    dirty.value = false
    toast.success('proposals.messages.saved')
    await proposalQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function onGenerate() {
  try {
    if (dirty.value) await save()
    await generate.mutateAsync(id.value)
    toast.success('proposals.messages.generating')
    await proposalQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function onSend() {
  try {
    await send.mutateAsync(id.value)
    toast.success('proposals.messages.sendd')
    await proposalQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-6">
    <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'proposals' })">
      ← {{ t('proposals.editor.back') }}
    </BaseButton>

    <LoadingState v-if="proposalQuery.isPending" />
    <ErrorState
      v-else-if="proposalQuery.isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="proposalQuery.refetch()"
    />
    <EmptyState v-else-if="!proposal" :title="t('common.errors.notFound')" />

    <article v-else class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-muted">{{ statusLabel }}</p>
          <h1 class="font-display text-3xl text-ink">{{ proposal.title }}</h1>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="secondary"
            :loading="Boolean(update.isPending)"
            :disabled="isGenerating"
            @click="save"
          >
            {{ t('common.actions.save') }}
          </BaseButton>
          <BaseButton
            :loading="Boolean(generate.isPending) || isGenerating"
            :disabled="isGenerating"
            @click="onGenerate"
          >
            {{ t('proposals.generate') }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            :loading="Boolean(send.isPending)"
            :disabled="isGenerating"
            @click="onSend"
          >
            {{ t('proposals.send') }}
          </BaseButton>
        </div>
      </div>

      <div
        v-if="isGenerating"
        class="rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm text-ink"
        role="status"
      >
        {{ t('proposals.editor.generating') }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseSelect
          v-model="templateId"
          :label="t('proposals.editor.template')"
          :options="templateOptions"
          :disabled="isGenerating"
        />
        <BaseSelect
          v-model="projectId"
          :label="t('proposals.editor.project')"
          :options="projectOptions"
          :disabled="isGenerating"
        />
      </div>

      <BaseInput
        v-model="title"
        :label="t('proposals.editor.title')"
        :disabled="isGenerating"
      />
      <BaseTextarea
        v-model="summary"
        :label="t('proposals.editor.summary')"
        :rows="3"
        :disabled="isGenerating"
      />
      <BaseTextarea
        v-model="body"
        :label="t('proposals.editor.body')"
        :rows="14"
        :disabled="isGenerating"
      />
    </article>
  </section>
</template>
