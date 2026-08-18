<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Download, FileText, Send, CheckCircle, Sparkles } from 'lucide-vue-next'

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
import { useContractExport } from '../composables/useContractExport'
import ContractDocumentCanvas from './ContractDocumentCanvas.vue'

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
const { exportPdf, isExporting } = useContractExport()

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

async function handleExportPdf() {
  if (!contract.value) return
  try {
    if (dirty.value) await save()
    await exportPdf({
      title: title.value || contract.value.title,
      body: body.value || contract.value.body,
      amount: contract.value.amount,
      currency: contract.value.currency,
      status: contract.value.status,
      signedAt: contract.value.signed_at,
      signedName: contract.value.signed_name,
      signedEmail: contract.value.signed_email,
      signedIp: contract.value.signed_ip,
      createdAt: contract.value.created_at,
    })
    toast.success('contracts.messages.exported')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function act(kind: 'generate' | 'export' | 'send' | 'sign') {
  try {
    if (kind === 'export') {
      await handleExportPdf()
      return
    }
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

    <article v-else class="space-y-8">
      <!-- Page Header & Action Controls -->
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-accent/10 text-accent border border-accent/20">
            {{ statusLabel }}
          </span>
          <h1 class="font-display text-3xl text-ink font-bold mt-1">{{ contract.title }}</h1>
          <p v-if="contract.signed_at" class="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {{ t('contracts.editor.signedAt', { date: new Date(contract.signed_at).toLocaleString() }) }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <BaseButton
            variant="secondary"
            :loading="update.isPending.value"
            :disabled="isGenerating"
            @click="save"
          >
            {{ t('common.actions.save') }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            :loading="isExporting"
            :disabled="isGenerating"
            @click="handleExportPdf"
          >
            <Download class="h-4 w-4 mr-1.5" />
            Export PDF
          </BaseButton>

          <BaseButton
            v-for="kind in (['generate', 'send', 'sign'] as const)"
            :key="kind"
            :variant="kind === 'sign' ? 'primary' : 'secondary'"
            :loading="action.isPending.value || (kind === 'generate' && isGenerating)"
            :disabled="isGenerating && kind !== 'generate'"
            @click="act(kind)"
          >
            <Sparkles v-if="kind === 'generate'" class="h-4 w-4 mr-1.5" />
            <Send v-else-if="kind === 'send'" class="h-4 w-4 mr-1.5" />
            <CheckCircle v-else-if="kind === 'sign'" class="h-4 w-4 mr-1.5" />
            {{ t(`contracts.${kind}`) }}
          </BaseButton>
        </div>
      </div>

      <div
        v-if="isGenerating"
        class="rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm text-ink flex items-center gap-2"
        role="status"
      >
        <Sparkles class="h-4 w-4 text-accent animate-spin" />
        <span>{{ t('contracts.editor.generating') }}</span>
      </div>

      <!-- Editor Controls -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1 space-y-4 rounded-xl border border-border bg-canvas-elevated p-5 shadow-sm">
          <h2 class="font-display text-base font-bold text-ink">Contract Settings</h2>
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
          <BaseInput
            v-model="title"
            :label="t('contracts.editor.title')"
            :disabled="isGenerating"
          />
        </div>

        <div class="lg:col-span-2 space-y-4">
          <BaseTextarea
            v-model="body"
            :label="t('contracts.editor.body')"
            :rows="12"
            :disabled="isGenerating"
          />
        </div>
      </div>

      <!-- Document Preview Canvas & Audit Certificate -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl font-bold text-ink flex items-center gap-2">
            <FileText class="h-5 w-5 text-accent" />
            Document Preview
          </h2>
          <span class="text-xs text-muted">Real-time Markdown document rendering</span>
        </div>

        <ContractDocumentCanvas :contract="{ ...contract, title, body }" />
      </div>
    </article>
  </section>
</template>
