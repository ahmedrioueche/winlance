<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { BaseButton, EmptyState, ErrorState, LoadingState } from '@/shared/components/base'
import { useLeadDetailData } from '../../composables/detail/useLeadDetailData'
import LeadDetailContactsSection from '../detail/LeadDetailContactsSection.vue'
import LeadDetailFollowUpsSection from '../detail/LeadDetailFollowUpsSection.vue'
import LeadDetailHeader from '../detail/LeadDetailHeader.vue'
import LeadDetailNotesSection from '../detail/LeadDetailNotesSection.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ''))

const {
  lead,
  isPending,
  isError,
  refetch,
  statusModel,
  contactFirst,
  contactLast,
  contactEmail,
  noteContent,
  followUpAt,
  followUpNotes,
  createContactPending,
  createNotePending,
  createFollowUpPending,
  completeFollowUpPending,
  onStatusChange,
  onRescore,
  addContact,
  addNote,
  addFollowUp,
  markComplete,
} = useLeadDetailData(id)
</script>

<template>
  <section class="w-full space-y-8">
    <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'leads' })">
      ← {{ t('leads.detail.back') }}
    </BaseButton>

    <LoadingState v-if="isPending" />
    <ErrorState
      v-else-if="isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="refetch()"
    />
    <EmptyState v-else-if="!lead" :title="t('common.errors.notFound')" />

    <template v-else>
      <LeadDetailHeader
        v-model:status-model="statusModel"
        :lead="lead"
        @status-change="onStatusChange"
        @rescore="onRescore"
      />

      <LeadDetailContactsSection
        v-model:contact-first="contactFirst"
        v-model:contact-last="contactLast"
        v-model:contact-email="contactEmail"
        :contacts="lead.contacts"
        :create-contact-pending="createContactPending"
        @add-contact="addContact"
      />

      <LeadDetailNotesSection
        v-model:note-content="noteContent"
        :notes="lead.notes"
        :create-note-pending="createNotePending"
        @add-note="addNote"
      />

      <LeadDetailFollowUpsSection
        v-model:follow-up-at="followUpAt"
        v-model:follow-up-notes="followUpNotes"
        :follow-ups="lead.follow_ups"
        :create-follow-up-pending="createFollowUpPending"
        :complete-follow-up-pending="completeFollowUpPending"
        @add-follow-up="addFollowUp"
        @mark-complete="markComplete"
      />
    </template>
  </section>
</template>
