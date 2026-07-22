<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

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

function fillDemo() {
  email.value = 'demo@winlance.local'
  password.value = 'demo-password-change-me'
}
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.login.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.login.subtitle') }}</p>

    <div
      v-if="demoEnabled"
      class="mt-4 rounded-md border border-border bg-accent-soft px-3 py-3 text-sm text-ink"
    >
      <p>{{ t('auth.login.demoHint') }}</p>
      <BaseButton class="mt-2" size="sm" variant="secondary" @click="fillDemo">
        {{ t('auth.login.demoFill') }}
      </BaseButton>
    </div>

    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
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
