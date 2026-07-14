<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { rescoreLead } from '../api'
import {
  useCompleteFollowUpMutation,
  useCreateContactMutation,
  useCreateFollowUpMutation,
  useCreateNoteMutation,
  useLeadQuery,
  useTransitionLeadMutation,
} from '../queries'
import { LEAD_STATUSES, type LeadStatus } from '../types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = computed(() => String(route.params.id))
const leadIdNum = computed(() => Number(id.value))
const leadQuery = useLeadQuery(id)
const lead = computed(() => leadQuery.data.value)
const transition = useTransitionLeadMutation()
const createContact = useCreateContactMutation()
const createNote = useCreateNoteMutation()
const createFollowUp = useCreateFollowUpMutation()
const completeFollowUp = useCompleteFollowUpMutation()

const statusModel = ref<LeadStatus>('NEW')
const contactFirst = ref('')
const contactLast = ref('')
const contactEmail = ref('')
const noteContent = ref('')
const followUpAt = ref('')
const followUpNotes = ref('')

watch(
  lead,
  (value) => {
    if (value) statusModel.value = value.status
  },
  { immediate: true },
)

const statusOptions = LEAD_STATUSES.map((value) => ({
  value,
  label: t(`leads.status.${value}`),
}))

async function onStatusChange() {
  if (!lead.value || statusModel.value === lead.value.status) return
  try {
    await transition.mutateAsync({ id: id.value, status: statusModel.value })
    toast.success('leads.messages.transitioned')
  } catch (error) {
    statusModel.value = lead.value.status
    toast.errorFromUnknown(error)
  }
}

async function onRescore() {
  try {
    await rescoreLead(id.value)
    await leadQuery.refetch()
    toast.success('leads.messages.rescored')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function addContact() {
  try {
    await createContact.mutateAsync({
      lead: leadIdNum.value,
      first_name: contactFirst.value,
      last_name: contactLast.value,
      email: contactEmail.value,
    })
    contactFirst.value = ''
    contactLast.value = ''
    contactEmail.value = ''
    toast.success('leads.messages.contactAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function addNote() {
  try {
    await createNote.mutateAsync({ lead: leadIdNum.value, content: noteContent.value })
    noteContent.value = ''
    toast.success('leads.messages.noteAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function addFollowUp() {
  try {
    await createFollowUp.mutateAsync({
      lead: leadIdNum.value,
      scheduled_at: new Date(followUpAt.value).toISOString(),
      notes: followUpNotes.value,
    })
    followUpAt.value = ''
    followUpNotes.value = ''
    toast.success('leads.messages.followUpAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function markComplete(followUpId: number) {
  try {
    await completeFollowUp.mutateAsync({ id: followUpId })
    toast.success('leads.messages.followUpCompleted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <section class="w-full space-y-8">
    <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'leads' })">
      ← {{ t('leads.detail.back') }}
    </BaseButton>

    <LoadingState v-if="leadQuery.isPending" />
    <ErrorState
      v-else-if="leadQuery.isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="leadQuery.refetch()"
    />
    <EmptyState v-else-if="!lead" :title="t('common.errors.notFound')" />

    <template v-else>
      <div>
        <h1 class="font-display text-3xl text-ink">{{ lead.title }}</h1>
        <p class="mt-2 whitespace-pre-wrap text-ink-soft">
          {{ lead.description || t('leads.detail.noDescription') }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
          {{ t('leads.list.score', { score: lead.score }) }}
        </p>
        <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
          {{ t('leads.detail.value', { value: lead.estimated_value }) }}
        </p>
        <p class="rounded-lg border border-border bg-canvas-elevated p-4 text-sm">
          {{ t('leads.detail.probability', { value: lead.probability }) }}
        </p>
      </div>

      <BaseSelect
        v-model="statusModel"
        :label="t('leads.detail.status')"
        :options="statusOptions"
        @update:model-value="onStatusChange"
      />
      <BaseButton variant="secondary" @click="onRescore">{{ t('leads.detail.rescore') }}</BaseButton>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('leads.contacts.title') }}</h2>
        <EmptyState v-if="!lead.contacts?.length" :title="t('leads.contacts.empty')" />
        <ul v-else class="space-y-2">
          <li
            v-for="contact in lead.contacts"
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
        <BaseButton :loading="Boolean(createContact.isPending)" @click="addContact">
          {{ t('leads.contacts.add') }}
        </BaseButton>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('leads.notes.title') }}</h2>
        <EmptyState v-if="!lead.notes?.length" :title="t('leads.notes.empty')" />
        <ul v-else class="space-y-2">
          <li
            v-for="note in lead.notes"
            :key="note.id"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm whitespace-pre-wrap"
          >
            {{ note.content }}
          </li>
        </ul>
        <BaseTextarea v-model="noteContent" :label="t('leads.notes.content')" :rows="3" />
        <BaseButton :loading="Boolean(createNote.isPending)" @click="addNote">
          {{ t('leads.notes.add') }}
        </BaseButton>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('leads.followUps.title') }}</h2>
        <EmptyState v-if="!lead.follow_ups?.length" :title="t('leads.followUps.empty')" />
        <ul v-else class="space-y-2">
          <li
            v-for="item in lead.follow_ups"
            :key="item.id"
            class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm"
          >
            <div>
              <p class="font-medium text-ink">
                {{ formatWhen(item.scheduled_at) }}
                <span v-if="item.completed" class="text-success">
                  · {{ t('leads.followUps.done') }}
                </span>
              </p>
              <p class="text-muted">{{ item.notes }}</p>
            </div>
            <BaseButton
              v-if="!item.completed"
              size="sm"
              variant="secondary"
              :loading="Boolean(completeFollowUp.isPending)"
              @click="markComplete(item.id)"
            >
              {{ t('leads.followUps.complete') }}
            </BaseButton>
          </li>
        </ul>
        <div class="grid gap-3 sm:grid-cols-2">
          <BaseInput
            v-model="followUpAt"
            :label="t('leads.followUps.when')"
            type="datetime-local"
          />
          <BaseInput v-model="followUpNotes" :label="t('leads.followUps.notes')" />
        </div>
        <BaseButton :loading="Boolean(createFollowUp.isPending)" @click="addFollowUp">
          {{ t('leads.followUps.add') }}
        </BaseButton>
      </section>
    </template>
  </section>
</template>
