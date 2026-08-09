<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FolderPlus, Save, Send, Trash2 } from 'lucide-vue-next'
import { BaseButton } from '@/shared/components/base'
import type { Proposal } from '../../types'

interface Props {
  proposal?: Proposal
  isSaving: boolean
  isCreatingProject: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  save: []
  publish: []
  createProject: []
  delete: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ t('proposals.editor.title') }}
        </h1>
        <span
          class="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          :class="proposal?.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-accent-soft text-accent border-accent/30'"
        >
          {{ proposal?.status || 'DRAFT' }}
        </span>
      </div>
      <p class="mt-1 text-xs text-muted">
        Configure scope deliverables, target client, total investment, and workspace parameters
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <BaseButton
        v-if="proposal?.status === 'ACCEPTED' && !proposal?.project_id"
        size="sm"
        :loading="isCreatingProject"
        @click="emit('createProject')"
      >
        <FolderPlus class="h-4 w-4" />
        <span>{{ t('proposals.editor.createProjectBtn') }}</span>
      </BaseButton>

      <BaseButton
        v-else-if="proposal?.project_id"
        variant="secondary"
        size="sm"
        @click="$router.push(`/app/projects/${proposal.project_id}/overview`)"
      >
        <FolderPlus class="h-4 w-4 text-accent" />
        <span>{{ t('proposals.editor.openWorkspaceBtn') }}</span>
      </BaseButton>

      <BaseButton
        v-if="proposal?.status === 'DRAFT' || proposal?.status === 'READY'"
        size="sm"
        :loading="isSaving"
        @click="emit('publish')"
      >
        <Send class="h-4 w-4" />
        <span>{{ t('proposals.editor.publishBtn') }}</span>
      </BaseButton>

      <BaseButton variant="secondary" size="sm" :loading="isSaving" @click="emit('save')">
        <Save class="h-4 w-4" />
        <span>Save Draft</span>
      </BaseButton>

      <BaseButton
        variant="primary"
        class="!bg-red-600 !text-white hover:!bg-red-700"
        size="sm"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>
</template>
