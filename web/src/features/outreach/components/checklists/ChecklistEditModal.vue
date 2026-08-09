<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseCheckbox, BaseInput, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  isUpdating: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const editContent = defineModel<string>('editContent', { default: '' })
const editOrder = defineModel<string>('editOrder', { default: '0' })
const editDoneDefault = defineModel<boolean>('editDoneDefault', { default: false })

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('outreach.checklists.editItem')"
    @close="emit('close')"
  >
    <div class="space-y-3">
      <BaseInput v-model="editContent" :label="t('outreach.checklists.itemContent')" />
      <BaseInput v-model="editOrder" type="number" :label="t('outreach.checklists.orderLabel')" />
      <BaseCheckbox v-model="editDoneDefault" :label="t('outreach.checklists.doneDefaultLabel')" />
    </div>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">
        {{ t('common.actions.cancel') }}
      </BaseButton>
      <BaseButton :loading="isUpdating" @click="emit('save')">
        {{ t('common.actions.save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
