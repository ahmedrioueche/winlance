<script setup lang="ts">
import { BaseButton, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  isPending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  discardAndView: []
  saveAndView: []
}>()
</script>

<template>
  <BaseModal
    :open="open"
    title="Unsaved Changes"
    persistent
    @close="emit('close')"
  >
    <p class="text-sm text-muted leading-relaxed">
      You have unsaved changes. What would you like to do before viewing this version?
    </p>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        Cancel
      </BaseButton>
      <BaseButton variant="secondary" size="sm" @click="emit('discardAndView')">
        Discard &amp; View
      </BaseButton>
      <BaseButton size="sm" :loading="isPending" @click="emit('saveAndView')">
        Save &amp; View
      </BaseButton>
    </template>
  </BaseModal>
</template>
