<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Edit3, Plus } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import type { ProjectMilestone, ProjectTask, TaskPriority, TaskStatus } from '../../types'

interface Props {
  open: boolean
  editingTask: ProjectTask | null
  isSubmitting: boolean
  milestones?: ProjectMilestone[]
}

const props = withDefaults(defineProps<Props>(), {
  milestones: () => [],
})

const emit = defineEmits<{
  close: []
  save: []
}>()

const taskTitle = defineModel<string>('taskTitle', { default: '' })
const taskDescription = defineModel<string>('taskDescription', { default: '' })
const taskMilestoneId = defineModel<string>('taskMilestoneId', { default: '' })
const taskStatus = defineModel<TaskStatus>('taskStatus', { default: 'TODO' })
const taskPriority = defineModel<TaskPriority>('taskPriority', { default: 'MEDIUM' })
const taskDueDate = defineModel<string>('taskDueDate', { default: '' })

const { t } = useI18n()

const milestoneOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [
    { value: '', label: t('projects.tasks.form.noMilestone', 'No Milestone (General Task)') },
  ]
  props.milestones.forEach((m) => {
    options.push({
      value: m.id,
      label: m.title,
    })
  })
  return options
})

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'TODO', label: t('projects.tasks.statuses.todo', 'To Do') },
  { value: 'IN_PROGRESS', label: t('projects.tasks.statuses.inProgress', 'In Progress') },
  { value: 'IN_REVIEW', label: t('projects.tasks.statuses.inReview', 'In Review') },
  { value: 'DONE', label: t('projects.tasks.statuses.done', 'Done') },
])

const priorityOptions = computed<SelectOption[]>(() => [
  { value: 'LOW', label: t('projects.tasks.priorities.low', 'Low') },
  { value: 'MEDIUM', label: t('projects.tasks.priorities.medium', 'Medium') },
  { value: 'HIGH', label: t('projects.tasks.priorities.high', 'High') },
  { value: 'URGENT', label: t('projects.tasks.priorities.urgent', 'Urgent') },
])
</script>

<template>
  <BaseModal
    :open="open"
    :title="editingTask ? t('projects.tasks.editTask', 'Edit Task') : t('projects.tasks.addNewTask', 'Add New Task')"
    @close="emit('close')"
  >
    <div class="space-y-4 text-xs">
      <BaseInput
        v-model="taskTitle"
        :label="t('projects.tasks.form.titleLabel', 'Task Title')"
        :placeholder="t('projects.tasks.form.titlePlaceholder', 'e.g. Design homepage hero section')"
        required
      />

      <BaseSelect
        v-model="taskMilestoneId"
        :label="t('projects.tasks.form.milestoneLabel', 'Milestone Phase')"
        :options="milestoneOptions"
      />

      <BaseTextarea
        v-model="taskDescription"
        :label="t('projects.tasks.form.descLabel', 'Description')"
        :placeholder="t('projects.tasks.form.descPlaceholder', 'Detailed task scope or instructions...')"
        :rows="3"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BaseSelect
          v-model="taskStatus"
          :label="t('projects.tasks.form.statusLabel', 'Status')"
          :options="statusOptions"
        />

        <BaseSelect
          v-model="taskPriority"
          :label="t('projects.tasks.form.priorityLabel', 'Priority')"
          :options="priorityOptions"
        />

        <BaseInput
          v-model="taskDueDate"
          type="date"
          :label="t('projects.tasks.form.dueDateLabel', 'Due Date')"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="isSubmitting"
        @click="emit('save')"
      >
        <Plus v-if="!editingTask" class="h-3.5 w-3.5" />
        <Edit3 v-else class="h-3.5 w-3.5" />
        <span>{{ editingTask ? t('projects.tasks.saveChanges', 'Save Changes') : t('projects.tasks.createTask', 'Create Task') }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
