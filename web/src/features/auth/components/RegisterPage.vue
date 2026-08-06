<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import { googleTokenLogin } from 'vue3-google-login'
import { useAuthStore } from '@/features/auth'
import { BaseButton, BaseInput } from '@/shared/components/base'
import { getApiFieldErrors } from '@/shared/toast/errorMessages'
import { useToast } from '@/shared/toast/useToast'

import { useFeatureFlag } from '@/shared/composables/useFeatureFlag'

const demoEnabled = useFeatureFlag('enableDemoAuth')

function fillDemo() {
  username.value = 'demo@winlance.local'
  email.value = 'demo@winlance.local'
  password.value = 'DemoPass123!'
}


const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const isGoogleLoading = ref(false)
const fieldErrors = reactive({
  username: '',
  email: '',
  password: '',
})

function clearFieldErrors() {
  fieldErrors.username = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
}

async function onSubmit() {
  submitting.value = true
  clearFieldErrors()
  try {
    await auth.register(username.value, email.value, password.value)
    toast.success('auth.register.success')
    await router.push({ name: 'login' })
  } catch (error) {
    const errors = getApiFieldErrors(error)
    fieldErrors.username = errors.username ?? ''
    fieldErrors.email = errors.email ?? ''
    fieldErrors.password = errors.password ?? ''
    // Prefer inline field errors over a duplicate toast.
    if (!fieldErrors.username && !fieldErrors.email && !fieldErrors.password) {
      toast.errorFromUnknown(error)
    }
  } finally {
    submitting.value = false
  }
}

async function onGoogleLogin() {
  isGoogleLoading.value = true
  try {
    const response = await googleTokenLogin()
    if (response?.access_token) {
      await auth.socialLogin('google', response.access_token)
      toast.success('auth.login.success')
      await router.push({ name: 'dashboard' })
    }
  } catch (error) {
    console.error('Google login error', error)
    toast.errorFromUnknown(error)
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.register.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.register.subtitle') }}</p>

    <div class="mt-6">
      <BaseButton
        variant="secondary"
        class="w-full flex items-center justify-center space-x-2"
        @click="onGoogleLogin"
        :loading="isGoogleLoading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        <span>Continue with Google</span>
      </BaseButton>

      <div class="relative mt-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-canvas-elevated px-2 text-muted">Or continue with email</span>
        </div>
      </div>
    </div>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="username"
        :label="t('auth.register.usernameLabel')"
        required
        autocomplete="username"
        :error="fieldErrors.username || undefined"
        @update:model-value="fieldErrors.username = ''"
      />
      <BaseInput
        v-model="email"
        :label="t('auth.register.emailLabel')"
        type="email"
        required
        autocomplete="email"
        :error="fieldErrors.email || undefined"
        @update:model-value="fieldErrors.email = ''"
      />
      <BaseInput
        v-model="password"
        :label="t('auth.register.passwordLabel')"
        type="password"
        required
        autocomplete="new-password"
        :hint="t('auth.register.passwordHint')"
        :error="fieldErrors.password || undefined"
        @update:model-value="fieldErrors.password = ''"
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
