<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/shared/components/base'
import type { SelectOption } from '@/shared/components/base/BaseSelect.vue'
import { openCreateClientModal } from '@/shared/modal/registry'
import { useToast } from '@/shared/toast/useToast'
import { useCreateProjectMutation } from '../queries'

export interface ClientOption {
  name: string
  email?: string
}

interface Props {
  open?: boolean
  clients?: ClientOption[]
  presetClientName?: string
  presetClientEmail?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
  clients: () => [],
  presetClientName: '',
  presetClientEmail: '',
})

const emit = defineEmits<{
  close: []
  created: [projectId: string]
}>()

const { t } = useI18n()
const toast = useToast()
const createProject = useCreateProjectMutation()

const title = ref('')
const selectedClientValue = ref('')
const clientName = ref('')
const clientEmail = ref('')
const status = ref('DRAFT')
const summary = ref('')

const customClients = ref<ClientOption[]>([])

const titleError = ref('')
const clientError = ref('')

const allClients = computed<ClientOption[]>(() => {
  const list = [...props.clients]
  customClients.value.forEach((c) => {
    if (!list.some((existing) => existing.name === c.name)) {
      list.push(c)
    }
  })
  return list
})

const isAddingNewClient = computed(() => {
  if (props.presetClientName) return false
  return allClients.value.length === 0
})

const clientSelectOptions = computed<SelectOption[]>(() => {
  if (allClients.value.length === 0) return []

  return allClients.value.map((c) => ({
    value: c.name,
    label: c.email ? `${c.name} (${c.email})` : c.name,
  }))
})

const statusOptions: SelectOption[] = [
  { value: 'DRAFT', label: t('projects.status.draft', 'Draft') },
  { value: 'ACTIVE', label: t('projects.status.active', 'Active') },
  { value: 'ON_HOLD', label: t('projects.status.on_hold', 'On Hold') },
  { value: 'COMPLETED', label: t('projects.status.completed', 'Completed') },
  { value: 'CANCELLED', label: t('projects.status.cancelled', 'Cancelled') },
]

function resetForm() {
  title.value = ''
  status.value = 'DRAFT'
  summary.value = ''
  titleError.value = ''
  clientError.value = ''
  customClients.value = []

  if (props.presetClientName) {
    clientName.value = props.presetClientName
    clientEmail.value = props.presetClientEmail || ''
    selectedClientValue.value = props.presetClientName
  } else if (allClients.value.length > 0) {
    const first = allClients.value[0]
    selectedClientValue.value = first?.name ?? ''
    clientName.value = first?.name ?? ''
    clientEmail.value = first?.email ?? ''
  } else {
    selectedClientValue.value = ''
    clientName.value = ''
    clientEmail.value = ''
  }
}

function handleTriggerCreateClientModal() {
  openCreateClientModal({
    onCreated: (newClient: { id: string; name: string; email?: string }) => {
      customClients.value.push({
        name: newClient.name,
        email: newClient.email,
      })
      selectedClientValue.value = newClient.name
      clientName.value = newClient.name
      clientEmail.value = newClient.email ?? ''
    },
  })
}

watch(selectedClientValue, (val) => {
  if (props.presetClientName) return
  clientError.value = ''
  const match = allClients.value.find((c) => c.name === val)
  if (match) {
    clientName.value = match.name
    clientEmail.value = match.email ?? ''
  }
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  },
  { immediate: true },
)

async function handleSubmit() {
  titleError.value = ''
  clientError.value = ''

  let hasError = false
  if (!title.value.trim()) {
    titleError.value = t('common.errors.validation', 'Title is required')
    hasError = true
  }

  if (!clientName.value.trim()) {
    clientError.value = t('projects.errors.clientRequired', 'A client is required for the project.')
    hasError = true
  }

  if (hasError) return

  try {
    const project = await createProject.mutateAsync({
      title: title.value.trim(),
      client_name: clientName.value.trim(),
      client_email: clientEmail.value.trim() || undefined,
      status: status.value,
      summary: summary.value.trim() || undefined,
    })

    toast.success(t('projects.createdSuccess', 'Project created successfully.'))
    emit('created', project.id)
    emit('close')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('projects.createModalTitle', 'Create New Project')"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="title"
        :label="t('projects.fields.title', 'Project Title')"
        :placeholder="t('projects.fields.titlePlaceholder', 'e.g. E-Commerce Redesign')"
        required
        :error="titleError"
      />

      <!-- Client Display / Selection Section -->
      <div class="space-y-2">
        <!-- Preset Client Read-Only View -->
        <div v-if="presetClientName" class="space-y-1">
          <label class="block text-sm font-medium text-ink">
            {{ t('projects.fields.client', 'Client') }}
          </label>
          <div class="rounded-lg border border-border bg-canvas p-2.5 text-sm font-semibold text-ink flex items-center justify-between">
            <span>{{ presetClientName }}</span>
            <span v-if="presetClientEmail" class="text-xs font-normal text-muted truncate max-w-[200px]">{{ presetClientEmail }}</span>
          </div>
        </div>

        <!-- Dynamic Client Select Dropdown (when no preset) -->
        <template v-else>
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-ink">
              {{ t('projects.fields.client', 'Client') }}
              <span class="text-error" aria-hidden="true">*</span>
            </label>

            <button
              type="button"
              class="text-xs font-semibold text-accent hover:underline focus:outline-none"
              @click="handleTriggerCreateClientModal"
            >
              {{ t('projects.fields.addNewClient', '+ Create Client') }}
            </button>
          </div>

          <!-- If clients exist, show dropdown -->
          <BaseSelect
            v-if="allClients.length > 0"
            v-model="selectedClientValue"
            label=""
            :options="clientSelectOptions"
            :error="clientError"
          />

          <!-- Empty case notice -->
          <div
            v-else
            class="rounded-lg border border-border/80 bg-canvas-muted/60 p-3 text-xs text-muted"
          >
            {{ t('projects.fields.noClientsFound', 'No existing clients found. Please enter new client details below.') }}
          </div>

          <!-- Manual Client Inputs (shown when empty case) -->
          <div v-if="isAddingNewClient" class="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
            <BaseInput
              v-model="clientName"
              :label="t('projects.fields.clientName', 'Client Name')"
              :placeholder="t('projects.fields.clientNamePlaceholder', 'Acme Corp')"
              required
              :error="clientError"
            />

            <BaseInput
              v-model="clientEmail"
              type="email"
              :label="t('projects.fields.clientEmail', 'Client Email')"
              :placeholder="t('projects.fields.clientEmailPlaceholder', 'client{\'@\'}acme.com')"
            />
          </div>
        </template>
      </div>

      <BaseSelect
        v-model="status"
        :label="t('projects.fields.status', 'Initial Status')"
        :options="statusOptions"
      />

      <BaseTextarea
        v-model="summary"
        :label="t('projects.fields.summary', 'Summary / Notes')"
        :placeholder="t('projects.fields.summaryPlaceholder', 'Brief scope or overview...')"
      />
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">
        {{ t('common.actions.cancel', 'Cancel') }}
      </BaseButton>
      <BaseButton
        :loading="createProject.isPending.value"
        @click="handleSubmit"
      >
        {{ t('projects.createSubmit', 'Create Project') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
