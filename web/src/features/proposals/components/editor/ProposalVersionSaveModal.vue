<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  versionName: string
  isPending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:versionName': [val: string]
  close: []
  confirm: []
  skip: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('proposals.editor.versions.saveModalTitle', 'Save New Version')"
    @close="emit('skip')"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted leading-relaxed">
        {{ t('proposals.editor.versions.saveModalText', 'Your changes have been saved. Name this version to keep it in your history.') }}
      </p>
      <BaseInput
        :model-value="versionName"
        :label="t('proposals.editor.versions.whatChanged', 'What changed?')"
        :placeholder="t('proposals.editor.versions.whatChangedPlaceholder', 'e.g. Updated scope & pricing')"
        @update:model-value="emit('update:versionName', $event)"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('skip')">
        {{ t('proposals.editor.versions.skipBtn', 'Skip — content saved') }}
      </BaseButton>
      <BaseButton size="sm" :loading="isPending" @click="emit('confirm')">
        {{ t('proposals.editor.versions.saveVersionBtn', 'Save Version') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
