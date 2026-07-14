<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton, EmptyState } from '@/shared/components/base'

const { t } = useI18n()

function reload() {
  window.location.assign('/')
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-lg items-center px-page">
    <EmptyState
      :title="t('common.errors.pageTitle')"
      :description="t('common.errors.pageMessage')"
    >
      <template #action>
        <div class="flex flex-wrap justify-center gap-2">
          <BaseButton @click="reload">{{ t('common.actions.reload') }}</BaseButton>
          <RouterLink to="/">
            <BaseButton variant="secondary">{{ t('common.nav.home') }}</BaseButton>
          </RouterLink>
        </div>
      </template>
    </EmptyState>
  </div>
</template>
