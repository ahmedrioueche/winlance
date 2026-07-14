<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { updateCurrentUser } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth'
import { BaseButton, BaseInput, LoadingState } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const form = reactive({
  username: '',
  first_name: '',
  last_name: '',
})

onMounted(async () => {
  try {
    const user = auth.user ?? (await auth.hydrateUser())
    form.username = user.username
    form.first_name = user.first_name
    form.last_name = user.last_name
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  saving.value = true
  try {
    const user = await updateCurrentUser({ ...form })
    auth.user = user
    toast.success('auth.profile.success')
  } catch (error) {
    toast.errorFromUnknown(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="w-full max-w-lg">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.profile.title') }}</h1>
    <p class="mt-2 text-muted">{{ t('auth.profile.subtitle') }}</p>
    <LoadingState v-if="loading" class="mt-8" />
    <form v-else class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="form.username" :label="t('auth.profile.usernameLabel')" required />
      <BaseInput v-model="form.first_name" :label="t('auth.profile.firstNameLabel')" />
      <BaseInput v-model="form.last_name" :label="t('auth.profile.lastNameLabel')" />
      <p class="text-sm text-muted">{{ t('auth.profile.emailReadonly', { email: auth.user?.email }) }}</p>
      <BaseButton type="submit" :loading="saving">{{ t('auth.profile.saveButton') }}</BaseButton>
    </form>
  </section>
</template>
