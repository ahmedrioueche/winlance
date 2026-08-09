<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'
import type { OutreachTemplate } from '../../types'

interface Props {
  renderTarget: OutreachTemplate | null
  rendered: string
  renderPending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  render: []
  insertRaw: []
  insertRendered: []
}>()

const clientName = defineModel<string>('clientName', { default: '' })
const company = defineModel<string>('company', { default: '' })
const roleTitle = defineModel<string>('roleTitle', { default: '' })

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="renderTarget != null"
    :title="t('outreach.templates.renderTitle')"
    @close="emit('close')"
  >
    <div v-if="renderTarget" class="space-y-3 text-xs">
      <p class="text-sm font-semibold text-muted">{{ renderTarget.title }}</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <BaseInput v-model="clientName" :label="t('outreach.templates.clientName')" />
        <BaseInput v-model="company" :label="t('outreach.templates.company')" />
        <BaseInput v-model="roleTitle" :label="t('outreach.templates.roleTitle')" />
      </div>
      <BaseButton :loading="renderPending" @click="emit('render')">
        {{ t('outreach.templates.runRender') }}
      </BaseButton>
      <div
        v-if="rendered"
        class="rounded-md border border-border bg-canvas p-3 whitespace-pre-wrap text-xs text-ink"
      >
        {{ rendered }}
      </div>
    </div>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">
        {{ t('common.actions.cancel') }}
      </BaseButton>
      <BaseButton variant="secondary" @click="emit('insertRaw')">
        {{ t('outreach.templates.insertRaw') }}
      </BaseButton>
      <BaseButton @click="emit('insertRendered')">
        {{ t('outreach.templates.insertRendered') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
