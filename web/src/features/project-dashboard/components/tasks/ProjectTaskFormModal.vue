<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Edit3, Plus } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { ProjectTask, TaskPriority, TaskStatus } from '../../types'

interface Props {
  open: boolean
  editingTask: ProjectTask | null
  isSubmitting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const taskTitle = defineModel<string>('taskTitle', { default: '' })
const taskDescription = defineModel<string>('taskDescription', { default: '' })
const taskStatus = defineModel<TaskStatus>('taskStatus', { default: 'TODO' })
const taskPriority = defineModel<TaskPriority>('taskPriority', { default: 'MEDIUM' })
const taskDueDate = defineModel<string>('taskDueDate', { default: '' })

const { t } = useI18n()

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'TODO', label: t('projects.tasks.statuses.todo') },
  { value: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress') },
  { value: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview') },
  { value: 'DONE', label: t('projects.tasks.statuses.done') },
])

const priorityOptions = computed<SelectOption[]>(() => [
  { value: 'LOW', label: t('projects.tasks.priorities.low') },
  { value: 'MEDIUM', label: t('projects.tasks.priorities.medium') },
  { value: 'HIGH', label: t('projects.tasks.priorities.high') },
  { value: 'URGENT', label: t('projects.tasks.priorities.urgent') },
])
</script>

<template>
  <BaseModal
    :open="open"
    :title="editingTask ? t('projects.tasks.editTask') : t('projects.tasks.addNewTask')"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <BaseInput
        v-model="taskTitle"
        :label="t('projects.tasks.form.titleLabel')"
        :placeholder="t('projects.tasks.form.titlePlaceholder')"
        required
      />

      <BaseTextarea
        v-model="taskDescription"
        :label="t('projects.tasks.form.descLabel')"
        :placeholder="t('projects.tasks.form.descPlaceholder')"
        :rows="3"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BaseSelect
          v-model="taskStatus"
          :label="t('projects.tasks.form.statusLabel')"
          :options="statusOptions"
        />

        <BaseSelect
          v-model="taskPriority"
          :label="t('projects.tasks.form.priorityLabel')"
          :options="priorityOptions"
        />

        <BaseInput
          v-model="taskDueDate"
          type="date"
          :label="t('projects.tasks.form.dueDateLabel')"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="isSubmitting"
        @click="emit('save')"
      >
        <Plus v-if="!editingTask" class="h-3.5 w-3.5" />
        <Edit3 v-else class="h-3.5 w-3.5" />
        <span>{{ editingTask ? t('projects.tasks.saveChanges') : t('projects.tasks.createTask') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
