<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { passwordResetRequest } from '@/features/auth/api'
import { BaseButton, BaseInput, SuccessState } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const email = ref('')
const submitting = ref(false)
const sent = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    await passwordResetRequest(email.value)
    sent.value = true
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.reset.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.reset.subtitle') }}</p>

    <SuccessState
      v-if="sent"
      class="mt-6"
      :title="t('auth.reset.sentTitle')"
      :message="t('auth.reset.sentMessage')"
    />
    <form v-else class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="email" :label="t('auth.reset.emailLabel')" type="email" required autocomplete="email" />
      <BaseButton type="submit" class="w-full" :loading="submitting">
        {{ t('auth.reset.submitButton') }}
      </BaseButton>
    </form>

    <p class="mt-6 text-sm">
      <RouterLink class="underline-offset-2 hover:underline" to="/login">{{ t('auth.reset.toLogin') }}</RouterLink>
    </p>
  </section>
</template>
