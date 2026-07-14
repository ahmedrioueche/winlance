<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { verifyEmailRequest } from '@/features/auth/api'
import { BaseButton, LoadingState, SuccessState } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const status = ref<'loading' | 'success' | 'error'>('loading')

onMounted(async () => {
  const token = String(route.query.token ?? '')
  if (!token) {
    status.value = 'error'
    toast.errorFromCode('validation_error')
    return
  }
  try {
    await verifyEmailRequest(token)
    status.value = 'success'
  } catch (error) {
    status.value = 'error'
    toast.errorFromUnknown(error)
  }
})
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('auth.verify.title') }}</h1>
    <LoadingState v-if="status === 'loading'" class="mt-6" :label="t('common.loading.content')" />
    <SuccessState
      v-else-if="status === 'success'"
      class="mt-6"
      :title="t('auth.verify.successTitle')"
      :message="t('auth.verify.successMessage')"
    >
      <template #action>
        <BaseButton @click="router.push({ name: 'login' })">{{ t('auth.verify.toLogin') }}</BaseButton>
      </template>
    </SuccessState>
    <div v-else class="mt-6">
      <BaseButton variant="secondary" @click="router.push({ name: 'login' })">
        {{ t('auth.verify.toLogin') }}
      </BaseButton>
    </div>
  </section>
</template>
