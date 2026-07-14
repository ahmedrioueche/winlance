<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton, EmptyState } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-lg items-center px-page">
    <EmptyState
      :title="t('common.errors.notFoundTitle')"
      :description="t('common.errors.notFoundMessage')"
    >
      <template #action>
        <RouterLink to="/">
          <BaseButton>{{ t('common.nav.home') }}</BaseButton>
        </RouterLink>
      </template>
    </EmptyState>
  </div>
</template>
