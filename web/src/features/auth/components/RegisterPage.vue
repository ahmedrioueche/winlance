<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'


import { useAuthStore } from '@/features/auth'
import { BaseButton, BaseInput } from '@/shared/components/base'
import { getApiFieldErrors } from '@/shared/toast/errorMessages'
import { useToast } from '@/shared/toast/useToast'


const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)

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


</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.register.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.register.subtitle') }}</p>

    <div class="relative mt-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-canvas-elevated px-2 text-muted">Or continue with email</span>
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
