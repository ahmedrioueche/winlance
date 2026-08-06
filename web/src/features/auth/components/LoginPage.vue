<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { googleTokenLogin } from 'vue3-google-login'
import { useAuthStore } from '@/features/auth'
import { useFeatureFlag } from '@/shared/composables/useFeatureFlag'
import { BaseButton, BaseCheckbox, BaseInput } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const demoEnabled = useFeatureFlag('enableDemoAuth')

const email = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)
const isGoogleLoading = ref(false)

const redirectTarget = computed(() => {
  const raw = route.query.redirect
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    return value
  }
  return null
})

async function onSubmit() {
  submitting.value = true
  try {
    await auth.login(email.value, password.value, remember.value)
    toast.success('auth.login.success')
    await router.push(redirectTarget.value ?? { name: 'dashboard' })
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    submitting.value = false
  }
}

async function onGoogleLogin() {
  isGoogleLoading.value = true
  try {
    const response = await googleTokenLogin()
    if (response?.access_token) {
      await auth.socialLogin('google', response.access_token, remember.value)
      toast.success('auth.login.success')
      await router.push(redirectTarget.value ?? { name: 'dashboard' })
    }
  } catch (error) {
    console.error('Google login error', error)
    toast.errorFromUnknown(error)
  } finally {
    isGoogleLoading.value = false
  }
}

function fillDemo() {
  email.value = 'demo@winlance.local'
  password.value = 'DemoPass123!'
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.login.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.login.subtitle') }}</p>

    <div class="mt-6">
      <BaseButton
        variant="secondary"
        class="w-full flex items-center justify-center space-x-2"
        :loading="isGoogleLoading"
        @click="onGoogleLogin"
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

    <div
      v-if="demoEnabled"
      class="mt-4 rounded-md border border-border bg-accent-soft px-3 py-3 text-sm text-ink"
    >
      <p>{{ t('auth.login.demoHint') }}</p>
      <BaseButton class="mt-2" size="sm" variant="secondary" @click="fillDemo">
        {{ t('auth.login.demoFill') }}
      </BaseButton>
    </div>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        :label="t('auth.login.emailLabel')"
        type="email"
        autocomplete="email"
        required
      />
      <BaseInput
        v-model="password"
        :label="t('auth.login.passwordLabel')"
        type="password"
        autocomplete="current-password"
        required
      />
      <BaseCheckbox v-model="remember" :label="t('auth.login.rememberLabel')" />
      <BaseButton type="submit" class="w-full" :loading="submitting">
        {{ t('auth.login.submitButton') }}
      </BaseButton>
    </form>

    <p class="mt-6 text-sm text-muted">
      <RouterLink class="text-ink underline-offset-2 hover:underline" to="/register">
        {{ t('auth.login.toRegister') }}
      </RouterLink>
      ·
      <RouterLink class="text-ink underline-offset-2 hover:underline" to="/password-reset">
        {{ t('auth.login.toReset') }}
      </RouterLink>
    </p>
  </section>
</template>
