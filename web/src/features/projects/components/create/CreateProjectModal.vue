<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight, FolderPlus } from 'lucide-vue-next'
import { BaseButton, BaseModal } from '@/shared/components/base'
import { useCreateProjectForm } from '../../composables/create/useCreateProjectForm'
import CreateProjectStepClient from './CreateProjectStepClient.vue'
import CreateProjectStepDetails from './CreateProjectStepDetails.vue'

interface Props {
  open?: boolean
  presetClientName?: string
  presetClientEmail?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
})

const emit = defineEmits<{
  close: []
  created: [id: string]
}>()

const { t } = useI18n()

const {
  currentStep,
  title,
  clientName,
  clientEmail,
  proposalId,
  budget,
  currency,
  startDate,
  dueDate,
  summary,
  proposals,
  isSubmitting,
  handleCreateProject,
} = useCreateProjectForm(
  props.presetClientName,
  props.presetClientEmail,
  (newId) => {
    emit('created', newId)
    emit('close')
  },
)
</script>

<template>
  <BaseModal
    :open="open"
    title="Create Project Workspace"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between text-xs text-muted border-b border-border/60 pb-3">
        <span class="font-semibold text-ink">Step {{ currentStep }} of 2: {{ currentStep === 1 ? 'Client & Proposal' : 'Budget & Schedule' }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="h-2 w-8 rounded-full transition-colors"
            :class="currentStep === 1 ? 'bg-accent' : 'bg-canvas-muted'"
            @click="currentStep = 1"
          />
          <button
            type="button"
            class="h-2 w-8 rounded-full transition-colors"
            :class="currentStep === 2 ? 'bg-accent' : 'bg-canvas-muted'"
            @click="currentStep = 2"
          />
        </div>
      </div>

      <CreateProjectStepClient
        v-if="currentStep === 1"
        v-model:title="title"
        v-model:client-name="clientName"
        v-model:client-email="clientEmail"
        v-model:proposal-id="proposalId"
        :proposals="proposals"
      />

      <CreateProjectStepDetails
        v-else-if="currentStep === 2"
        v-model:budget="budget"
        v-model:currency="currency"
        v-model:start-date="startDate"
        v-model:due-date="dueDate"
        v-model:summary="summary"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ t('actions.cancel') }}
      </BaseButton>

      <BaseButton v-if="currentStep === 1" size="sm" :disabled="!title.trim()" @click="currentStep = 2">
        <span>Next Step</span>
        <ArrowRight class="h-4 w-4" />
      </BaseButton>

      <BaseButton
        v-else-if="currentStep === 2"
        size="sm"
        :loading="isSubmitting"
        :disabled="!title.trim()"
        @click="handleCreateProject"
      >
        <FolderPlus class="h-4 w-4" />
        <span>Create Project</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
