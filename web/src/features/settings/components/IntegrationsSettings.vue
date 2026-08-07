<script setup lang="ts">
import { Calendar, CreditCard, MessageSquare, Zap } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const googleConnected = ref(true)
const stripeConnected = ref(true)
const slackConnected = ref(false)
const webhooksConnected = ref(false)

function toggleIntegration(name: string, stateRef: { value: boolean }) {
  stateRef.value = !stateRef.value
  toast.success(`${name} ${stateRef.value ? 'connected' : 'disconnected'}.`)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.integrations.title', 'Connected Apps & API') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.integrations.subtitle', 'Integrate third-party tools to automate your workflow') }}
      </p>
    </div>

    <div class="space-y-3">
      <!-- Google Calendar -->
      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
            <Calendar class="h-5 w-5" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-ink">
              {{ t('settings.integrations.googleCalendar', 'Google Calendar') }}
            </h4>
            <p class="text-xs text-muted">Sync project deadlines and client meetings automatically</p>
          </div>
        </div>

        <BaseButton
          :variant="googleConnected ? 'secondary' : 'primary'"
          size="sm"
          @click="toggleIntegration('Google Calendar', googleConnected)"
        >
          {{ googleConnected ? 'Connected ✓' : 'Connect' }}
        </BaseButton>
      </div>

      <!-- Stripe Payments -->
      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500">
            <CreditCard class="h-5 w-5" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-ink">
              {{ t('settings.integrations.stripe', 'Stripe Payments') }}
            </h4>
            <p class="text-xs text-muted">Accept credit card and bank transfer payments from clients</p>
          </div>
        </div>

        <BaseButton
          :variant="stripeConnected ? 'secondary' : 'primary'"
          size="sm"
          @click="toggleIntegration('Stripe', stripeConnected)"
        >
          {{ stripeConnected ? 'Connected ✓' : 'Connect' }}
        </BaseButton>
      </div>

      <!-- Slack Alerts -->
      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
            <MessageSquare class="h-5 w-5" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-ink">
              {{ t('settings.integrations.slack', 'Slack Alerts') }}
            </h4>
            <p class="text-xs text-muted">Get notifications in Slack channels for signed contracts</p>
          </div>
        </div>

        <BaseButton
          :variant="slackConnected ? 'secondary' : 'primary'"
          size="sm"
          @click="toggleIntegration('Slack', slackConnected)"
        >
          {{ slackConnected ? 'Connected ✓' : 'Connect' }}
        </BaseButton>
      </div>

      <!-- Custom Webhooks -->
      <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <Zap class="h-5 w-5" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-ink">
              {{ t('settings.integrations.webhooks', 'Custom Webhooks') }}
            </h4>
            <p class="text-xs text-muted">Send real-time HTTP webhooks to external endpoints</p>
          </div>
        </div>

        <BaseButton
          :variant="webhooksConnected ? 'secondary' : 'primary'"
          size="sm"
          @click="toggleIntegration('Custom Webhooks', webhooksConnected)"
        >
          {{ webhooksConnected ? 'Configured ✓' : 'Configure' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
