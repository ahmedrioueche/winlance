<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseCheckbox } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const emailAlerts = ref(true)
const proposalAlerts = ref(true)
const contractAlerts = ref(true)
const weeklyDigest = ref(false)
const isSaving = ref(false)

async function handleSave() {
  isSaving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    toast.success(t('settings.savedSuccess', 'Settings updated successfully.'))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.notifications.title', 'Notification Preferences') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.notifications.subtitle', 'Configure how and when you receive alerts and digests') }}
      </p>
    </div>

    <form class="space-y-3" @submit.prevent="handleSave">
      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div>
          <h4 class="text-sm font-semibold text-ink">
            {{ t('settings.notifications.emailAlerts', 'Email Notifications') }}
          </h4>
          <p class="text-xs text-muted">Receive account and security notices via email</p>
        </div>
        <BaseCheckbox v-model="emailAlerts" />
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div>
          <h4 class="text-sm font-semibold text-ink">
            {{ t('settings.notifications.proposalAlerts', 'Proposal Accepted & View Alerts') }}
          </h4>
          <p class="text-xs text-muted">Instant alert when a client opens or accepts a proposal</p>
        </div>
        <BaseCheckbox v-model="proposalAlerts" />
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div>
          <h4 class="text-sm font-semibold text-ink">
            {{ t('settings.notifications.contractAlerts', 'Contract Signed Alerts') }}
          </h4>
          <p class="text-xs text-muted">Instant notification when a contract signature is completed</p>
        </div>
        <BaseCheckbox v-model="contractAlerts" />
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div>
          <h4 class="text-sm font-semibold text-ink">
            {{ t('settings.notifications.weeklyDigest', 'Weekly Performance Digest') }}
          </h4>
          <p class="text-xs text-muted">Weekly email report of active projects, revenue, and pending leads</p>
        </div>
        <BaseCheckbox v-model="weeklyDigest" />
      </div>

      <div class="flex justify-end pt-3">
        <BaseButton :loading="isSaving" type="submit">
          Save Preferences
        </BaseButton>
      </div>
    </form>
  </div>
</template>
