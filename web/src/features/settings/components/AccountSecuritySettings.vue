<script setup lang="ts">
import { Laptop } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSaving = ref(false)
const twoFactorEnabled = ref(false)

async function handleUpdatePassword() {
  if (!currentPassword.value || !newPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    toast.error('New passwords do not match.')
    return
  }

  isSaving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))
    toast.success('Password updated successfully.')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } finally {
    isSaving.value = false
  }
}

function toggle2FA() {
  twoFactorEnabled.value = !twoFactorEnabled.value
  toast.success(
    twoFactorEnabled.value
      ? 'Two-Factor Authentication enabled.'
      : 'Two-Factor Authentication disabled.',
  )
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.security.title', 'Account & Security') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.security.subtitle', 'Manage password, authentication methods, and active sessions') }}
      </p>
    </div>

    <!-- Password Change Section -->
    <div class="rounded-xl border border-border bg-canvas p-5 space-y-4">
      <h3 class="font-display text-base font-semibold text-ink">
        {{ t('settings.security.changePassword', 'Change Password') }}
      </h3>

      <form class="space-y-4" @submit.prevent="handleUpdatePassword">
        <BaseInput
          v-model="currentPassword"
          type="password"
          :label="t('settings.security.currentPassword', 'Current Password')"
          required
        />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="newPassword"
            type="password"
            :label="t('settings.security.newPassword', 'New Password')"
            required
          />
          <BaseInput
            v-model="confirmPassword"
            type="password"
            :label="t('settings.security.confirmPassword', 'Confirm New Password')"
            required
          />
        </div>
        <div class="flex justify-end pt-1">
          <BaseButton :loading="isSaving" type="submit">
            {{ t('settings.security.updatePasswordSubmit', 'Update Password') }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Two Factor Auth Section -->
    <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas p-5">
      <div>
        <h3 class="font-display text-base font-semibold text-ink">
          {{ t('settings.security.twoFactorTitle', 'Two-Factor Authentication (2FA)') }}
        </h3>
        <p class="mt-0.5 text-xs text-muted">
          {{ t('settings.security.twoFactorSubtitle', 'Secure your account with an authenticator app (TOTP)') }}
        </p>
      </div>

      <BaseButton
        :variant="twoFactorEnabled ? 'secondary' : 'primary'"
        size="sm"
        @click="toggle2FA"
      >
        {{ twoFactorEnabled ? 'Disable 2FA' : t('settings.security.enableTwoFactor', 'Enable 2FA') }}
      </BaseButton>
    </div>

    <!-- Active Sessions Section -->
    <div class="rounded-xl border border-border bg-canvas p-5 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-base font-semibold text-ink">
          {{ t('settings.security.activeSessions', 'Active Login Sessions') }}
        </h3>
        <button
          type="button"
          class="text-xs font-semibold text-accent hover:underline"
          @click="toast.success('All other sessions revoked.')"
        >
          {{ t('settings.security.revokeOtherSessions', 'Revoke Other Sessions') }}
        </button>
      </div>

      <div class="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/60">
        <div class="flex items-center gap-2">
          <Laptop class="h-4 w-4 text-ink-soft shrink-0" />
          <div>
            <p class="font-medium text-ink-soft">Windows 11 • Chrome Browser</p>
            <p class="text-[11px] text-muted">Current Session • New York, USA</p>
          </div>
        </div>
        <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Active Now
        </span>
      </div>
    </div>
  </div>
</template>
