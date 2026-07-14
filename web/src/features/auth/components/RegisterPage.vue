<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/features/auth'
import { BaseButton, BaseInput } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    await auth.register(username.value, email.value, password.value)
    toast.success('auth.register.success')
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
    <h1 class="font-display text-3xl text-ink">{{ t('auth.register.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.register.subtitle') }}</p>

    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="username" :label="t('auth.register.usernameLabel')" required autocomplete="username" />
      <BaseInput v-model="email" :label="t('auth.register.emailLabel')" type="email" required autocomplete="email" />
      <BaseInput
        v-model="password"
        :label="t('auth.register.passwordLabel')"
        type="password"
        required
        autocomplete="new-password"
        :hint="t('auth.register.passwordHint')"
      />
      <BaseButton type="submit" class="w-full" :loading="submitting">
        {{ t('auth.register.submitButton') }}
      </BaseButton>
    </form>

    <p class="mt-6 text-sm text-muted">
      <RouterLink class="text-ink underline-offset-2 hover:underline" to="/login">
        {{ t('auth.register.toLogin') }}
      </RouterLink>
    </p>
  </section>
</template>
