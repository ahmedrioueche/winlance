<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { LoadingState } from '@/shared/components/base'

interface Props {
  /** Fills the app content area instead of a centered auth/blank viewport. */
  embedded?: boolean
}

withDefaults(defineProps<Props>(), {
  embedded: false,
})

const { t } = useI18n()
</script>

<template>
  <div :class="embedded ? 'w-full' : 'flex min-h-dvh w-full items-start px-6 py-8 md:px-8'">
    <div class="w-full">
      <LoadingState :label="t('common.loading.page')" :rows="4" />
    </div>
  </div>
</template>
