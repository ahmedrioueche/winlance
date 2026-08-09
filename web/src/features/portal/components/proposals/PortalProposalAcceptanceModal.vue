<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FileCheck } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  isAccepting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  accept: []
}>()

const signerName = defineModel<string>('signerName', { default: '' })
const signerEmail = defineModel<string>('signerEmail', { default: '' })

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('portal.acceptanceModal.title')"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <p class="text-muted leading-relaxed">
        {{ t('portal.acceptanceModal.subtitle') }}
      </p>

      <div class="space-y-3">
        <BaseInput
          v-model="signerName"
          :label="t('portal.acceptanceModal.nameLabel')"
          :placeholder="t('portal.acceptanceModal.namePlaceholder')"
          required
        />

        <BaseInput
          v-model="signerEmail"
          type="email"
          :label="t('portal.acceptanceModal.emailLabel')"
          :placeholder="t('portal.acceptanceModal.emailPlaceholder')"
          required
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="isAccepting"
        :disabled="!signerName.trim() || !signerEmail.trim()"
        @click="emit('accept')"
      >
        <FileCheck class="h-4 w-4" />
        <span>{{ t('portal.acceptanceModal.submitBtn') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
