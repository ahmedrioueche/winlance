<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseTextarea, EmptyState } from '@/shared/components/base'
import type { Note } from '../../types'

interface Props {
  notes?: Note[]
  createNotePending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  addNote: []
}>()

const noteContent = defineModel<string>('noteContent', { default: '' })

const { t } = useI18n()
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-xl text-ink">{{ t('leads.notes.title') }}</h2>
    <EmptyState v-if="!notes?.length" :title="t('leads.notes.empty')" />
    <ul v-else class="space-y-2">
      <li
        v-for="note in notes"
        :key="note.id"
        class="rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm whitespace-pre-wrap"
      >
        {{ note.content }}
      </li>
    </ul>
    <BaseTextarea v-model="noteContent" :label="t('leads.notes.content')" :rows="3" />
    <BaseButton :loading="createNotePending" @click="emit('addNote')">
      {{ t('leads.notes.add') }}
    </BaseButton>
  </section>
</template>
