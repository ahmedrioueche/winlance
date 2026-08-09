<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseModal } from '@/shared/components/base'
import type { ProjectTask } from '../../types'

interface Props {
  open: boolean
  task: ProjectTask | null
  isDeleting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('projects.tasks.confirmDeleteTitle')"
    @close="emit('close')"
  >
    <div class="space-y-3 text-xs">
      <p class="text-ink text-sm">
        {{ t('projects.tasks.confirmDeletePrompt', { title: task?.title || '' }) }}
      </p>
      <p class="text-muted">
        {{ t('projects.tasks.confirmDeleteMessage') }}
      </p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        class="!bg-red-600 !text-white hover:!bg-red-700"
        size="sm"
        :loading="isDeleting"
        @click="emit('confirm')"
      >
        {{ t('projects.tasks.deleteTask') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
