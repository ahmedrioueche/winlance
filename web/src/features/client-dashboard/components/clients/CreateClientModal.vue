<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, BaseModal, BaseTextarea } from '@/shared/components/base'

interface Props {
  open: boolean
  isSaving: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const name = defineModel<string>('name', { default: '' })
const companyName = defineModel<string>('companyName', { default: '' })
const email = defineModel<string>('email', { default: '' })
const phone = defineModel<string>('phone', { default: '' })
const notes = defineModel<string>('notes', { default: '' })

const { t } = useI18n()
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('clients.createClient')"
    @close="emit('close')"
  >
    <form class="space-y-4 text-xs" @submit.prevent="emit('save')">
      <BaseInput
        v-model="name"
        :label="t('clients.form.nameLabel')"
        :placeholder="t('clients.form.namePlaceholder')"
        required
      />

      <BaseInput
        v-model="companyName"
        :label="t('clients.form.companyLabel')"
        :placeholder="t('clients.form.companyPlaceholder')"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BaseInput
          v-model="email"
          type="email"
          :label="t('clients.form.emailLabel')"
          :placeholder="t('clients.form.emailPlaceholder')"
          required
        />

        <BaseInput
          v-model="phone"
          :label="t('clients.form.phoneLabel')"
          :placeholder="t('clients.form.phonePlaceholder')"
        />
      </div>

      <BaseTextarea
        v-model="notes"
        :label="t('clients.form.notesLabel')"
        :placeholder="t('clients.form.notesPlaceholder')"
        :rows="3"
      />
    </form>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>
      <BaseButton size="sm" :loading="isSaving" @click="emit('save')">
        {{ t('clients.createClient') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
