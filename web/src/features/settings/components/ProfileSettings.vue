<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const fullName = ref('Jane Doe')
const email = ref('jane@winlance.io')
const titleField = ref('Senior Full-Stack Consultant')
const hourlyRate = ref('125')
const currency = ref('USD')
const bio = ref('Experienced software engineer specializing in Vue 3, Django, and high-performance Web Applications.')
const isSaving = ref(false)

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
]

async function handleSave() {
  isSaving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))
    toast.success(t('settings.savedSuccess', 'Settings updated successfully.'))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.profile.title', 'Profile Information') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.profile.subtitle', 'Update your photo, personal details, and freelance rates') }}
      </p>
    </div>

    <!-- Avatar Upload Section -->
    <div class="flex items-center gap-4 rounded-xl border border-border bg-canvas p-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-2xl font-bold text-accent">
        JD
      </div>
      <div>
        <h4 class="text-sm font-semibold text-ink">Profile Avatar</h4>
        <p class="text-xs text-muted">JPG, PNG or GIF. 2MB max.</p>
        <BaseButton variant="secondary" size="sm" class="mt-2">
          {{ t('settings.profile.changePhoto', 'Change Photo') }}
        </BaseButton>
      </div>
    </div>

    <!-- Profile Form -->
    <form class="space-y-4" @submit.prevent="handleSave">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput
          v-model="fullName"
          :label="t('settings.profile.fullName', 'Full Name')"
          required
        />
        <BaseInput
          v-model="email"
          type="email"
          label="Email Address"
          required
        />
      </div>

      <BaseInput
        v-model="titleField"
        :label="t('settings.profile.titleField', 'Professional Title')"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput
          v-model="hourlyRate"
          type="number"
          :label="t('settings.profile.hourlyRate', 'Default Hourly Rate ($)')"
        />
        <BaseSelect
          v-model="currency"
          :label="t('settings.profile.currency', 'Preferred Currency')"
          :options="currencyOptions"
        />
      </div>

      <BaseTextarea
        v-model="bio"
        :label="t('settings.profile.bio', 'Professional Bio / Summary')"
      />

      <div class="flex justify-end pt-2">
        <BaseButton :loading="isSaving" type="submit">
          Save Profile
        </BaseButton>
      </div>
    </form>
  </div>
</template>
