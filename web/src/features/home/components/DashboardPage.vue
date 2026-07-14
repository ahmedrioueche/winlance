<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <section class="w-full">
    <h1 class="font-display text-3xl text-ink">
      {{ t('home.dashboard.title') }}
    </h1>
    <p class="mt-2 text-muted">{{ t('home.dashboard.subtitle') }}</p>
    <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink v-for="item in ['leads', 'proposals', 'contracts', 'projects', 'outreach', 'ai-coach', 'analytics']" :key="item" :to="`/app/${item}`">
        <BaseButton class="w-full" variant="secondary">{{ t(`common.nav.${item === 'ai-coach' ? 'aiCoach' : item}`) }}</BaseButton>
      </RouterLink>
    </div>
  </section>
</template>
