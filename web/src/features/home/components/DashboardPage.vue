<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { EmptyState } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="font-display text-3xl text-ink">
      {{ t('home.dashboard.title') }}
    </h1>
    <p class="mt-2 text-muted">{{ t('home.dashboard.subtitle') }}</p>
    <EmptyState
      class="mt-8"
      :title="t('home.dashboard.emptyTitle')"
      :description="t('home.dashboard.emptyDescription')"
    />
  </section>
</template>
