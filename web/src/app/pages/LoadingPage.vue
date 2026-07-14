<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { LoadingState } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-lg items-center px-page">
    <div class="w-full">
      <LoadingState :label="t('common.loading.page')" :rows="4" />
    </div>
  </div>
</template>
