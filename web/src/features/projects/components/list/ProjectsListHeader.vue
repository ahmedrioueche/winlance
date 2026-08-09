<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { BaseButton, BasePageHeader } from '@/shared/components/base'

defineEmits<{
  createProject: []
}>()

const { t } = useI18n()
</script>

<template>
  <BasePageHeader
    :title="t('projects.title')"
    :subtitle="t('projects.subtitle')"
  >
    <template #actions>
      <BaseButton size="sm" @click="$emit('createProject')">
        <Plus class="h-4 w-4" />
        <span>{{ t('projects.newProject') }}</span>
      </BaseButton>
    </template>
  </BasePageHeader>
</template>
