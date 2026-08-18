<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { googleTokenLogin } from 'vue3-google-login'
import { ArrowRight, Lock } from 'lucide-vue-next'

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
  <div class="rounded-2xl border border-border bg-canvas-elevated p-6 sm:p-7 shadow-xl backdrop-blur-md">
    <!-- Form Header -->
    <div class="mb-4 text-center sm:text-start">
      <h1 class="font-display text-xl sm:text-2xl font-bold text-ink">
        {{ t('auth.login.title') }}
      </h1>
      <p class="mt-1 text-xs text-ink-soft">
        {{ t('auth.login.subtitle') }}
      </p>
    </div>

    <!-- Social OAuth Button -->
    <div class="space-y-3">
      <BaseButton
        variant="secondary"
        class="w-full flex items-center justify-center gap-2.5 py-2 shadow-xs border border-border/80 hover:bg-canvas transition-colors"
        :loading="isGoogleLoading"
        @click="onGoogleLogin"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        <span class="text-xs font-semibold text-ink">Continue with Google</span>
      </BaseButton>

      <!-- Divider -->
      <div class="relative py-1">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border/80"></div>
        </div>
        <div class="relative flex justify-center text-[11px]">
          <span class="bg-canvas-elevated px-2.5 text-ink-soft">Or continue with email</span>
        </div>
      </div>
    </div>

    <!-- Demo Credentials Box -->
    <div
      v-if="demoEnabled"
      class="mt-3 rounded-xl border border-accent/20 bg-accent-soft/40 p-3 text-xs text-ink space-y-1.5"
    >
      <div class="flex items-center gap-1.5 font-semibold text-accent text-[11px]">
        <Lock class="w-3.5 h-3.5" />
        <span>{{ t('auth.login.demoHint') }}</span>
      </div>
      <BaseButton class="w-full" size="sm" variant="secondary" @click="fillDemo">
        {{ t('auth.login.demoFill') }}
      </BaseButton>
    </div>

    <!-- Login Form -->
    <form class="mt-4 space-y-3" @submit.prevent="onSubmit">
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

      <div class="flex items-center justify-between pt-0.5">
        <BaseCheckbox v-model="remember" :label="t('auth.login.rememberLabel')" />
        <RouterLink
          to="/password-reset"
          class="text-[11px] text-accent hover:underline font-medium"
        >
          {{ t('auth.login.toReset') }}
        </RouterLink>
      </div>

      <BaseButton type="submit" class="w-full justify-center py-2 text-xs font-bold shadow-md shadow-accent/20 group" :loading="submitting">
        <span>{{ t('auth.login.submitButton') }}</span>
        <ArrowRight class="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
      </BaseButton>
    </form>

    <!-- Navigation Footer -->
    <div class="mt-5 pt-4 border-t border-border/60 text-center text-xs text-ink-soft">
      <span>Don't have an account?</span>
      <RouterLink class="ms-1 font-bold text-accent hover:underline" to="/register">
        {{ t('auth.login.toRegister') }}
      </RouterLink>
    </div>
  </div>
</template>
