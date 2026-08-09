<script setup lang="ts">
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  projectTitle: string
  isDeleting: boolean
  isConfirmed: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmInputText = defineModel<string>('confirmInputText', { default: '' })
const confirmTitleText = defineModel<string>('confirmTitleText', { default: '' })
</script>

<template>
  <BaseModal
    :open="open"
    title="Delete Project Workspace"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <div class="rounded-xl border border-error/30 bg-error/10 p-3.5 text-error flex items-start gap-3">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-sm">Warning: Destructive Action</h4>
          <p class="mt-0.5 leading-relaxed">
            Deleting this project will permanently delete all tasks, milestones, scope requirements, and associated files.
          </p>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <p class="text-ink font-medium">
          To confirm deletion, please complete both confirmation inputs below:
        </p>

        <BaseInput
          v-model="confirmInputText"
          label='1. Type "DELETE" in capital letters'
          placeholder="DELETE"
          required
        />

        <BaseInput
          v-model="confirmTitleText"
          :label="`2. Type the exact project title: &quot;${projectTitle}&quot;`"
          :placeholder="projectTitle"
          required
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        Cancel
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
        <span>Permanently Delete Project</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
