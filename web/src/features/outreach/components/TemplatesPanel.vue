<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { consumeOutreachInsert, stashOutreachInsert } from '../insert'
import {
  useCreateTemplateMutation,
  useRenderTemplateMutation,
  useTemplatesQuery,
} from '../queries'
import { TEMPLATE_TYPES, type OutreachTemplate } from '../types'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const query = useTemplatesQuery()
const create = useCreateTemplateMutation()
const render = useRenderTemplateMutation()

const templates = computed(() => query.data.value ?? [])
const title = ref('')
const content = ref('')
const type = ref('EMAIL')
const tagNames = ref('')
const createOpen = ref(false)

const renderTarget = ref<OutreachTemplate | null>(null)
const clientName = ref('')
const company = ref('')
const roleTitle = ref('')
const rendered = ref('')

const typeOptions = TEMPLATE_TYPES.map((value) => ({
  value,
  label: t(`outreach.templates.types.${value}`),
}))

watch(
  () => route.query.fromCoach,
  (value) => {
    if (value !== '1') return
    const payload = consumeOutreachInsert()
    if (!payload?.body) return
    title.value = payload.title
    content.value = payload.body
    createOpen.value = true
    void router.replace({ query: { ...route.query, fromCoach: undefined } })
  },
  { immediate: true },
)

async function onCreate() {
  try {
    await create.mutateAsync({
      title: title.value.trim(),
      content: content.value,
      type: type.value,
      tag_names: tagNames.value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    })
    createOpen.value = false
    title.value = ''
    content.value = ''
    tagNames.value = ''
    toast.success('outreach.templates.created')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function openRender(template: OutreachTemplate) {
  renderTarget.value = template
  rendered.value = ''
  clientName.value = ''
  company.value = ''
  roleTitle.value = ''
}

async function onRender() {
  if (!renderTarget.value) return
  try {
    const result = await render.mutateAsync({
      id: renderTarget.value.id,
      context: {
        client_name: clientName.value,
        company: company.value,
        title: roleTitle.value,
      },
    })
    rendered.value = result.rendered
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function insertIntoProposal(mode: 'raw' | 'rendered') {
  if (!renderTarget.value) return
  const body =
    mode === 'rendered' && rendered.value ? rendered.value : renderTarget.value.content
  if (!body.trim()) {
    toast.errorKey('outreach.templates.insertEmpty')
    return
  }
  stashOutreachInsert({
    title: renderTarget.value.title,
    body,
    source: mode === 'rendered' ? 'rendered' : 'template',
    templateId: renderTarget.value.id,
  })
  renderTarget.value = null
  toast.success('outreach.templates.insertReady')
  await router.push({ name: 'proposals', query: { fromOutreach: '1' } })
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl text-ink">{{ t('outreach.templates.title') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('outreach.templates.subtitle') }}</p>
      </div>
      <BaseButton @click="createOpen = true">{{ t('outreach.templates.create') }}</BaseButton>
    </div>

    <LoadingState v-if="query.isPending.value" />
    <ErrorState
      v-else-if="query.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="query.refetch()"
    />
    <EmptyState v-else-if="!templates.length" :title="t('outreach.templates.empty')" />
    <ul v-else class="space-y-3">
      <li
        v-for="template in templates"
        :key="template.id"
        class="rounded-lg border border-border bg-canvas-elevated p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="font-medium text-ink">{{ template.title }}</h3>
            <p class="mt-1 text-xs text-muted">
              {{ t(`outreach.templates.types.${template.type}`) }}
              <span v-if="template.tags.length">
                · {{ template.tags.map((tag) => tag.name).join(', ') }}
              </span>
            </p>
          </div>
          <BaseButton size="sm" variant="secondary" @click="openRender(template)">
            {{ t('outreach.templates.render') }}
          </BaseButton>
        </div>
        <p class="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-ink-soft">
          {{ template.content }}
        </p>
      </li>
    </ul>

    <BaseModal
      :open="createOpen"
      :title="t('outreach.templates.create')"
      @close="createOpen = false"
    >
      <div class="space-y-3">
        <BaseInput v-model="title" :label="t('outreach.templates.name')" required />
        <BaseSelect v-model="type" :label="t('outreach.templates.type')" :options="typeOptions" />
        <BaseTextarea v-model="content" :label="t('outreach.templates.content')" :rows="6" />
        <BaseInput
          v-model="tagNames"
          :label="t('outreach.templates.tags')"
          :hint="t('outreach.templates.tagsHint')"
        />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="createOpen = false">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton :loading="create.isPending.value" @click="onCreate">
          {{ t('common.actions.create') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="renderTarget != null"
      :title="t('outreach.templates.renderTitle')"
      @close="renderTarget = null"
    >
      <div v-if="renderTarget" class="space-y-3">
        <p class="text-sm text-muted">{{ renderTarget.title }}</p>
        <div class="grid gap-3 sm:grid-cols-3">
          <BaseInput v-model="clientName" :label="t('outreach.templates.clientName')" />
          <BaseInput v-model="company" :label="t('outreach.templates.company')" />
          <BaseInput v-model="roleTitle" :label="t('outreach.templates.roleTitle')" />
        </div>
        <BaseButton :loading="render.isPending.value" @click="onRender">
          {{ t('outreach.templates.runRender') }}
        </BaseButton>
        <div
          v-if="rendered"
          class="rounded-md border border-border bg-canvas p-3 whitespace-pre-wrap text-sm text-ink"
        >
          {{ rendered }}
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="renderTarget = null">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton variant="secondary" @click="insertIntoProposal('raw')">
          {{ t('outreach.templates.insertRaw') }}
        </BaseButton>
        <BaseButton @click="insertIntoProposal('rendered')">
          {{ t('outreach.templates.insertRendered') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
