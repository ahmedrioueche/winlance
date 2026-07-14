<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { passwordResetConfirmRequest } from '@/features/auth/api'
import { BaseButton, BaseInput } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const password = ref('')
const submitting = ref(false)

async function onSubmit() {
  const token = String(route.query.token ?? '')
  if (!token) {
    toast.errorFromCode('validation_error')
    return
  }
  submitting.value = true
  try {
    await passwordResetConfirmRequest(token, password.value)
    toast.success('auth.resetConfirm.success')
    await router.push({ name: 'login' })
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.resetConfirm.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.resetConfirm.subtitle') }}</p>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="password"
        :label="t('auth.resetConfirm.passwordLabel')"
        type="password"
        required
        autocomplete="new-password"
      />
      <BaseButton type="submit" class="w-full" :loading="submitting">
        {{ t('auth.resetConfirm.submitButton') }}
      </BaseButton>
    </form>
  </section>
</template>
