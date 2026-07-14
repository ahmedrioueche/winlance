<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { ErrorState } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import { logger } from '@/shared/utils/logger'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const hasError = ref(false)

onErrorCaptured((error) => {
  hasError.value = true
  logger.error('Unhandled render error', error)
  toast.errorFromCode()
  return false
})

function goHome() {
  hasError.value = false
  void router.push({ name: 'home' })
}
</script>

<template>
  <ErrorState
    v-if="hasError"
    class="m-8"
    :title="t('common.errors.boundaryTitle')"
    :message="t('common.errors.boundaryMessage')"
    :retry-label="t('common.nav.home')"
    @retry="goHome"
  />
  <slot v-else />
</template>
