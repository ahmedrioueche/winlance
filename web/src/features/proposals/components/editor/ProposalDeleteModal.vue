<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  confirmText: string
  isDeleting: boolean
  proposalTitle?: string
  isConfirmed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  proposalTitle: '',
  isConfirmed: undefined,
})

const emit = defineEmits<{
  'update:confirmText': [val: string]
  close: []
  confirm: []
}>()

const { t } = useI18n()

const isConfirmValid = computed(() => {
  if (props.isConfirmed !== undefined) {
    return props.isConfirmed
  }
  return props.confirmText.trim().toUpperCase() === 'DELETE'
})
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('proposals.editor.versions.deleteModalTitle', 'Delete Proposal')"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <p class="text-muted leading-relaxed">
        <template v-if="proposalTitle">
          Are you sure you want to delete <span class="font-semibold text-ink">{{ proposalTitle }}</span>? This action is permanent and cannot be undone.
        </template>
        <template v-else>
          {{ t('proposals.editor.versions.deleteModalText', 'Are you sure you want to delete this proposal? This action is permanent and cannot be undone.') }}
        </template>
      </p>
      <p class="font-semibold text-ink">
        {{ t('proposals.editor.versions.deleteConfirmPrompt', 'To confirm deletion, type DELETE in capital letters below:') }}
      </p>
      <BaseInput
        :model-value="confirmText"
        :label="t('proposals.editor.versions.deleteConfirmationLabel', 'Confirmation')"
        placeholder="DELETE"
        @update:model-value="emit('update:confirmText', $event)"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        class="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
        :disabled="!isConfirmValid"
        :loading="isDeleting"
        @click="emit('confirm')"
      >
        <Trash2 class="h-3.5 w-3.5" />
        <span>{{ t('proposals.editor.deleteProposal', 'Delete Proposal') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
