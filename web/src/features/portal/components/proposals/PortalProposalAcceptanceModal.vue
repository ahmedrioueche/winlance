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
    :title="t('portal.acceptanceModal.title', 'Sign & Accept Proposal Document')"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <p class="text-muted leading-relaxed">
        {{ t('portal.acceptanceModal.subtitle', 'By typing your full name and signing below, you agree to the statement of work and milestone pricing.') }}
      </p>

      <div class="space-y-3">
        <BaseInput
          v-model="signerName"
          :label="t('portal.acceptanceModal.nameLabel', 'Signer Full Name')"
          :placeholder="t('portal.acceptanceModal.namePlaceholder', 'e.g. Sarah Jenkins')"
          required
        />

        <BaseInput
          v-model="signerEmail"
          type="email"
          :label="t('portal.acceptanceModal.emailLabel', 'Signer Email')"
          :placeholder="t('portal.acceptanceModal.emailPlaceholder')"
          required
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="isAccepting"
        :disabled="!signerName.trim() || !signerEmail.trim()"
        @click="emit('accept')"
      >
        <FileCheck class="h-4 w-4" />
        <span>{{ t('portal.acceptanceModal.submitBtn', 'Confirm & Sign Proposal') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
