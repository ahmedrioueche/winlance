<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  confirmText: string
  isDeleting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:confirmText': [val: string]
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal
    :open="open"
    title="Delete Proposal"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <p class="text-muted leading-relaxed">
        Are you sure you want to delete this proposal? This action is permanent and cannot be undone.
      </p>
      <p class="font-semibold text-ink">
        To confirm deletion, type <span class="text-red-500 font-mono font-bold">DELETE</span> in capital letters below:
      </p>
      <BaseInput
        :model-value="confirmText"
        label="Confirmation"
        placeholder="DELETE"
        @update:model-value="emit('update:confirmText', $event)"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        Cancel
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        class="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
        :disabled="confirmText.trim() !== 'DELETE'"
        :loading="isDeleting"
        @click="emit('confirm')"
      >
        <Trash2 class="h-3.5 w-3.5" />
        <span>Delete Proposal</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
