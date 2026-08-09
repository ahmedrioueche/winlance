<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  proposalTitle: string
  isDeleting: boolean
  isConfirmed: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmText = defineModel<string>('confirmText', { default: '' })

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    title="Delete Proposal Document"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <div class="rounded-xl border border-error/30 bg-error/10 p-3.5 text-error flex items-start gap-3">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-sm">Destructive Action</h4>
          <p class="mt-0.5 leading-relaxed">
            {{ t('proposals.editor.deletePrompt', { title: proposalTitle }) }}
          </p>
        </div>
      </div>

      <div class="space-y-2 pt-2">
        <BaseInput
          v-model="confirmText"
          label='Type "DELETE" to confirm'
          placeholder="DELETE"
          required
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        class="!bg-red-600 !text-white hover:!bg-red-700"
        size="sm"
        :disabled="!isConfirmed"
        :loading="isDeleting"
        @click="emit('confirm')"
      >
        <Trash2 class="h-4 w-4" />
        <span>Permanently Delete Proposal</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
