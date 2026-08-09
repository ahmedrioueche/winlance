<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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
import { useTemplatesState } from '../composables/templates/useTemplatesState'
import TemplateRenderModal from './templates/TemplateRenderModal.vue'

const { t } = useI18n()

const {
  query,
  templates,
  title,
  content,
  type,
  tagNames,
  createOpen,
  renderTarget,
  clientName,
  company,
  roleTitle,
  rendered,
  typeOptions,
  createPending,
  renderPending,
  onCreate,
  openRender,
  onRender,
  insertIntoProposal,
} = useTemplatesState()
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

    <!-- Create Template Modal -->
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
        <BaseButton :loading="createPending" @click="onCreate">
          {{ t('common.actions.create') }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Render Template Modal -->
    <TemplateRenderModal
      v-model:client-name="clientName"
      v-model:company="company"
      v-model:role-title="roleTitle"
      :render-target="renderTarget"
      :rendered="rendered"
      :render-pending="renderPending"
      @close="renderTarget = null"
      @render="onRender"
      @insert-raw="insertIntoProposal('raw')"
      @insert-rendered="insertIntoProposal('rendered')"
    />
  </section>
</template>
