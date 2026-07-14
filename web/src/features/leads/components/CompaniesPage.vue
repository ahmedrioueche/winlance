<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BaseButton,
  BaseInput,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useCompaniesQuery, useCreateCompanyMutation } from '../queries'

const { t } = useI18n()
const toast = useToast()
const query = useCompaniesQuery()
const create = useCreateCompanyMutation()

const name = ref('')
const website = ref('')
const industry = ref('')
const companies = computed(() => query.data.value?.results ?? [])

async function onCreate() {
  try {
    await create.mutateAsync({
      name: name.value,
      website: website.value,
      industry: industry.value,
    })
    name.value = ''
    website.value = ''
    industry.value = ''
    toast.success('leads.companies.created')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-6">
    <div>
      <h1 class="font-display text-3xl text-ink">{{ t('leads.companies.title') }}</h1>
      <p class="mt-2 text-muted">{{ t('leads.companies.subtitle') }}</p>
    </div>

    <LoadingState v-if="query.isPending" />
    <ErrorState
      v-else-if="query.isError"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="query.refetch()"
    />
    <EmptyState v-else-if="!companies.length" :title="t('leads.companies.empty')" />
    <ul v-else class="space-y-2">
      <li
        v-for="company in companies"
        :key="company.id"
        class="rounded-lg border border-border bg-canvas-elevated px-4 py-3"
      >
        <p class="font-medium text-ink">{{ company.name }}</p>
        <p class="text-sm text-muted">
          {{ company.industry || t('leads.companies.noIndustry') }}
          <span v-if="company.website"> · {{ company.website }}</span>
        </p>
      </li>
    </ul>

    <div class="rounded-xl border border-border bg-canvas-elevated p-4 space-y-3">
      <h2 class="font-display text-lg text-ink">{{ t('leads.companies.createTitle') }}</h2>
      <BaseInput v-model="name" :label="t('leads.companies.name')" required />
      <BaseInput v-model="website" :label="t('leads.companies.website')" />
      <BaseInput v-model="industry" :label="t('leads.companies.industry')" />
      <BaseButton :loading="Boolean(create.isPending)" @click="onCreate">
        {{ t('leads.companies.create') }}
      </BaseButton>
    </div>
  </section>
</template>
