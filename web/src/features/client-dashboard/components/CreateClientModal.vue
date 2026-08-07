<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput, BaseModal } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import { useCreateClientMutation } from '../queries'

interface Props {
  open?: boolean
  onCreated?: (client: { id: string; name: string; email?: string }) => void
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
})

const emit = defineEmits<{
  close: []
  created: [client: { id: string; name: string; email?: string }]
}>()

const { t } = useI18n()
const toast = useToast()
const createClient = useCreateClientMutation()

const name = ref('')
const email = ref('')
const nameError = ref('')

async function handleSubmit() {
  nameError.value = ''
  if (!name.value.trim()) {
    nameError.value = t('common.errors.validation', 'Name is required')
    return
  }

  try {
    const newClient = await createClient.mutateAsync({
      name: name.value.trim(),
      email: email.value.trim() || undefined,
    })

    toast.success(t('clients.createdSuccess', 'Client created successfully.'))
    if (props.onCreated) {
      props.onCreated(newClient)
    }
    emit('created', newClient)
    emit('close')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('clients.createModalTitle', 'Create New Client')"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="name"
        :label="t('clients.fields.name', 'Client Name')"
        :placeholder="t('clients.fields.namePlaceholder', 'e.g. Acme Corp')"
        required
        :error="nameError"
      />

      <BaseInput
        v-model="email"
        type="email"
        :label="t('clients.fields.email', 'Client Email')"
        :placeholder="t('clients.fields.emailPlaceholder', 'contact{\'@\'}acme.com')"
      />
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton :loading="createClient.isPending.value" @click="handleSubmit">
        {{ t('clients.createSubmit', 'Create Client') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
