<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, EmptyState } from '@/shared/components/base'
import type { Contact } from '../../types'

interface Props {
  contacts?: Contact[]
  createContactPending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  addContact: []
}>()

const contactFirst = defineModel<string>('contactFirst', { default: '' })
const contactLast = defineModel<string>('contactLast', { default: '' })
const contactEmail = defineModel<string>('contactEmail', { default: '' })

const { t } = useI18n()
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-xl text-ink">{{ t('leads.contacts.title') }}</h2>
    <EmptyState v-if="!contacts?.length" :title="t('leads.contacts.empty')" />
    <ul v-else class="space-y-2">
      <li
        v-for="contact in contacts"
        :key="contact.id"
        class="rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm"
      >
        {{ contact.first_name }} {{ contact.last_name }} ·
        {{ contact.email || t('leads.contacts.noEmail') }}
      </li>
    </ul>

    <div class="grid gap-3 sm:grid-cols-3">
      <BaseInput v-model="contactFirst" :label="t('leads.contacts.firstName')" />
      <BaseInput v-model="contactLast" :label="t('leads.contacts.lastName')" />
      <BaseInput v-model="contactEmail" :label="t('leads.contacts.email')" type="email" />
    </div>
    <BaseButton :loading="createContactPending" @click="emit('addContact')">
      {{ t('leads.contacts.add') }}
    </BaseButton>
  </section>
</template>
