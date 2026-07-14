<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/features/auth'
import { BaseButton, BaseCheckbox } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success('common.success.generic')
    await router.push({ name: 'dashboard' })
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">
      {{ t('auth.login.title') }}
    </h1>
    <p class="mt-2 text-sm text-muted">
      {{ t('auth.login.subtitle') }}
    </p>

    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-ink" for="email">
          {{ t('auth.login.emailLabel') }}
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-ink" for="password">
          {{ t('auth.login.passwordLabel') }}
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <BaseCheckbox v-model="remember" :label="t('auth.login.rememberLabel')" />
      <BaseButton type="submit" class="w-full" :loading="submitting">
        {{ t('auth.login.submitButton') }}
      </BaseButton>
    </form>
  </section>
</template>
