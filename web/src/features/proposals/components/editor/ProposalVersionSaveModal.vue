<script setup lang="ts">
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
</script>

<template>
  <BaseModal
    :open="open"
    title="Save New Version"
    @close="emit('skip')"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted leading-relaxed">
        Your changes have been saved. Name this version to keep it in your history.
      </p>
      <BaseInput
        :model-value="versionName"
        label="What changed?"
        placeholder="e.g. Updated scope & pricing"
        @update:model-value="emit('update:versionName', $event)"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('skip')">
        Skip — content saved
      </BaseButton>
      <BaseButton size="sm" :loading="isPending" @click="emit('confirm')">
        Save Version
      </BaseButton>
    </template>
  </BaseModal>
</template>
