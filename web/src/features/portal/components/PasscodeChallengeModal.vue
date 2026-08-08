<script setup lang="ts">
import { Lock, ShieldCheck } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useVerifyPasscodeMutation } from '../queries'

const props = defineProps<{
  token: string
  clientName: string
  companyName: string
  freelancerName: string
}>()

const emit = defineEmits<{
  unlocked: []
}>()

const { t } = useI18n()
const toast = useToast()
const verifyPasscode = useVerifyPasscodeMutation()

const passcode = ref('')
const errorMsg = ref('')

async function handleVerify() {
  if (!passcode.value.trim()) {
    errorMsg.value = t('portal.passcode.invalidError', 'Please enter your portal passcode.')
    return
  }
  errorMsg.value = ''

  try {
    await verifyPasscode.mutateAsync({
      token: props.token,
      passcode: passcode.value.trim(),
    })
    toast.success(t('portal.passcode.verifiedSuccess', 'Portal passcode verified!'))
    emit('unlocked')
  } catch {
    errorMsg.value = t('portal.passcode.invalidError', 'Invalid passcode. Please check with your freelancer.')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
    <div class="w-full max-w-md rounded-2xl border border-border bg-canvas-elevated p-6 sm:p-8 shadow-lift space-y-6">
      <div class="text-center space-y-3">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent">
          <Lock class="h-7 w-7" />
        </div>

        <div>
          <h2 class="font-display text-xl font-bold text-ink">
            {{ companyName ? `${companyName} ${t('portal.badge', 'Portal')}` : t('portal.nav.defaultClientPortal', 'Client Portal') }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ t('proposals.editor.preparedBy', 'Prepared by') }} <span class="font-semibold text-ink">{{ freelancerName || 'your freelancer' }}</span>
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-border/80 bg-canvas p-4 text-xs space-y-2 text-muted leading-relaxed">
        <div class="flex items-center gap-1.5 font-semibold text-ink">
          <ShieldCheck class="h-4 w-4 text-accent" />
          <span>{{ t('portal.passcode.title', 'Passcode Protected Portal') }}</span>
        </div>
        <p>
          {{ t('portal.passcode.description', 'This portal is protected for privacy. Please enter the passcode provided by your freelancer.') }}
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleVerify">
        <BaseInput
          v-model="passcode"
          type="password"
          :label="t('portal.passcode.placeholder', 'Portal Passcode')"
          :placeholder="t('portal.passcode.placeholder', 'Enter passcode...')"
          :error="errorMsg"
        />

        <BaseButton
          type="submit"
          class="w-full"
          :loading="verifyPasscode.isPending.value"
        >
          <span>{{ t('portal.passcode.unlock', 'Unlock Portal') }}</span>
        </BaseButton>
      </form>
    </div>
  </div>
</template>
