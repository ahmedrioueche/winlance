<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowRight, KeyRound } from 'lucide-vue-next'

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
  <div class="rounded-2xl border border-border bg-canvas-elevated p-8 sm:p-10 shadow-2xl backdrop-blur-md">
    <!-- Icon Header -->
    <div class="mb-6 text-center sm:text-start">
      <div class="inline-flex p-3 rounded-xl bg-accent-soft text-accent mb-3">
        <KeyRound class="w-6 h-6" />
      </div>
      <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink">
        {{ t('auth.reset.title') }}
      </h1>
      <p class="mt-2 text-xs sm:text-sm text-ink-soft">
        {{ t('auth.reset.subtitle') }}
      </p>
    </div>

    <SuccessState
      v-if="sent"
      class="mt-6"
      :title="t('auth.reset.sentTitle')"
      :message="t('auth.reset.sentMessage')"
    />

    <form v-else class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        :label="t('auth.reset.emailLabel')"
        type="email"
        required
        autocomplete="email"
      />
      <BaseButton type="submit" class="w-full justify-center py-2.5 text-sm shadow-md shadow-accent/20 group" :loading="submitting">
        <span>{{ t('auth.reset.submitButton') }}</span>
        <ArrowRight class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </BaseButton>
    </form>

    <div class="mt-8 pt-6 border-t border-border/60 text-center text-xs text-ink-soft">
      <RouterLink class="font-bold text-accent hover:underline" to="/login">
        {{ t('auth.reset.toLogin') }}
      </RouterLink>
    </div>
  </div>
</template>
