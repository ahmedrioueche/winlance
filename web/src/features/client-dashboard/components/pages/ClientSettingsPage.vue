<script setup lang="ts">
import { Check, Copy, Trash2, UserCheck } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import { useClientQuery, useDeleteClientMutation, useUpdateClientMutation } from '../../queries'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ''))
const clientQuery = useClientQuery(id)
const updateMutation = useUpdateClientMutation()
const deleteMutation = useDeleteClientMutation()

const client = computed(() => clientQuery.data.value)

// Form fields
const name = ref('')
const companyName = ref('')
const email = ref('')
const phone = ref('')
const website = ref('')
const location = ref('')
const industry = ref('')
const status = ref('ACTIVE')
const notes = ref('')

const isDeleteModalOpen = ref(false)
const copied = ref(false)

const statusOptions = computed(() => [
  { value: 'LEAD', label: t('clients.status.lead', 'Lead') },
  { value: 'PROPOSAL_SENT', label: t('clients.status.proposal_sent', 'Proposal Sent') },
  { value: 'NEGOTIATING', label: t('clients.status.negotiating', 'Negotiating') },
  { value: 'ACTIVE', label: t('clients.status.active', 'Active') },
  { value: 'COMPLETED', label: t('clients.status.completed', 'Completed') },
  { value: 'ARCHIVED', label: t('clients.status.archived', 'Archived') },
])

// Populate form when client data loads
watch(
  client,
  (val) => {
    if (val) {
      name.value = val.name || ''
      companyName.value = val.company_name || ''
      email.value = val.email || ''
      phone.value = val.phone || ''
      website.value = val.website || ''
      location.value = val.location || ''
      industry.value = val.industry || ''
      status.value = val.status || 'ACTIVE'
      notes.value = val.notes || ''
    }
  },
  { immediate: true },
)

const isFormDirty = computed(() => {
  if (!client.value) return false
  return (
    name.value.trim() !== (client.value.name || '').trim() ||
    companyName.value.trim() !== (client.value.company_name || '').trim() ||
    email.value.trim() !== (client.value.email || '').trim() ||
    phone.value.trim() !== (client.value.phone || '').trim() ||
    website.value.trim() !== (client.value.website || '').trim() ||
    location.value.trim() !== (client.value.location || '').trim() ||
    industry.value.trim() !== (client.value.industry || '').trim() ||
    status.value !== (client.value.status || 'ACTIVE') ||
    notes.value.trim() !== (client.value.notes || '').trim()
  )
})

const portalUrl = computed(() => {
  if (!client.value?.portal_token) return ''
  const origin = window.location.origin
  return `${origin}/portal/${client.value.portal_token}`
})

async function copyPortalUrl() {
  if (!portalUrl.value) return
  try {
    await navigator.clipboard.writeText(portalUrl.value)
    copied.value = true
    toast.success(t('clients.portalCopiedToast', 'Client portal link copied to clipboard!'))
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    toast.errorFromUnknown(err)
  }
}

async function handleSave() {
  if (!id.value || !isFormDirty.value) return
  try {
    await updateMutation.mutateAsync({
      id: id.value,
      name: name.value.trim(),
      company_name: companyName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      website: website.value.trim(),
      location: location.value.trim(),
      industry: industry.value.trim(),
      status: status.value,
      notes: notes.value.trim(),
    })
    toast.success(t('settings.savedSuccess', 'Client settings updated successfully.'))
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleDelete() {
  if (!id.value) return
  try {
    await deleteMutation.mutateAsync(id.value)
    toast.success(t('common.actions.deleteSuccess', 'Client deleted successfully.'))
    isDeleteModalOpen.value = false
    await router.push('/app/clients')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-display text-ink text-2xl font-bold">
          {{ t('clients.settings.title', 'Client Settings') }}
        </h1>
        <p class="text-muted mt-1 text-sm">
          {{
            t('clients.settings.subtitle', {
              name: client?.name || t('clients.settings.thisClient', 'this client'),
            })
          }}
        </p>
      </div>
      <BaseButton
        :disabled="!isFormDirty"
        :loading="updateMutation.isPending.value"
        @click="handleSave"
      >
        <UserCheck class="mr-1.5 h-4 w-4" />
        {{ t('common.actions.save', 'Save Changes') }}
      </BaseButton>
    </div>

    <!-- Loading / Error States -->
    <LoadingState v-if="clientQuery.isPending.value" class="py-12" />
    <ErrorState
      v-else-if="clientQuery.isError.value"
      class="py-12"
      :title="t('common.errors.generic', 'Failed to load client details')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="clientQuery.refetch()"
    />
    <EmptyState
      v-else-if="!client"
      class="py-12"
      :title="t('common.errors.notFound', 'Client not found')"
    />

    <!-- Main Settings Form -->
    <div v-else class="space-y-6">
      <!-- 1. Contact & Basic Details Card -->
      <section
        class="border-border bg-canvas-elevated shadow-soft space-y-4 rounded-2xl border p-6"
      >
        <h2 class="font-display text-ink border-border/60 border-b pb-3 text-lg font-bold">
          {{ t('clients.settings.contactDetails', 'Contact Details') }}
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseInput
            v-model="name"
            :label="t('clients.form.nameLabel', 'Client Full Name')"
            :placeholder="t('clients.form.namePlaceholder', 'e.g. Sarah Jenkins')"
            required
          />
          <BaseInput
            v-model="companyName"
            :label="t('clients.form.companyLabel', 'Company / Organization')"
            :placeholder="t('clients.form.companyPlaceholder', 'e.g. Rookie Corp')"
          />
          <BaseInput
            v-model="email"
            type="email"
            :label="t('clients.form.emailLabel', 'Email Address')"
            :placeholder="t('clients.form.emailPlaceholder', 'contact@example.com')"
          />
          <BaseInput
            v-model="phone"
            :label="t('clients.form.phoneLabel', 'Phone Number')"
            :placeholder="t('clients.form.phonePlaceholder', '+1 (555) 019-2834')"
          />
        </div>
      </section>

      <!-- 2. Business & Categorization Card -->
      <section
        class="border-border bg-canvas-elevated shadow-soft space-y-4 rounded-2xl border p-6"
      >
        <h2 class="font-display text-ink border-border/60 border-b pb-3 text-lg font-bold">
          {{ t('clients.settings.statusAndProfile', 'Status & Profile Info') }}
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseSelect
            v-model="status"
            :label="t('clients.form.statusLabel', 'Client Relationship Status')"
            :options="statusOptions"
          />
          <BaseInput
            v-model="industry"
            :label="t('clients.form.industryLabel', 'Industry')"
            :placeholder="t('clients.form.industryPlaceholder', 'e.g. Software & Technology')"
          />
          <BaseInput
            v-model="location"
            :label="t('clients.form.locationLabel', 'Location')"
            :placeholder="t('clients.form.locationPlaceholder', 'e.g. San Francisco, CA')"
          />
          <BaseInput
            v-model="website"
            :label="t('clients.form.websiteLabel', 'Website URL')"
            :placeholder="t('clients.form.websitePlaceholder', 'https://example.com')"
          />
        </div>
      </section>

      <!-- 3. Client Portal Card -->
      <section
        class="border-border bg-canvas-elevated shadow-soft space-y-4 rounded-2xl border p-6"
      >
        <h2 class="font-display text-ink border-border/60 border-b pb-3 text-lg font-bold">
          {{ t('clients.settings.portalLink', 'Client Portal Link') }}
        </h2>
        <p class="text-muted text-xs">
          {{
            t(
              'clients.settings.portalHelp',
              'Share this unique portal URL with your client to let them view active project proposals, contracts, and progress updates.',
            )
          }}
        </p>
        <div class="flex items-center gap-2">
          <input
            type="text"
            readonly
            :value="portalUrl"
            class="border-border bg-canvas text-ink flex-1 rounded-xl border px-3 py-2 font-mono text-xs focus:outline-none"
          />
          <BaseButton variant="secondary" size="sm" @click="copyPortalUrl">
            <Check v-if="copied" class="mr-1 h-4 w-4 text-emerald-500" />
            <Copy v-else class="mr-1 h-4 w-4" />
            {{
              copied
                ? t('common.actions.copied', 'Copied!')
                : t('common.actions.copyLink', 'Copy Link')
            }}
          </BaseButton>
        </div>
      </section>

      <!-- 4. Notes Card -->
      <section
        class="border-border bg-canvas-elevated shadow-soft space-y-4 rounded-2xl border p-6"
      >
        <h2 class="font-display text-ink border-border/60 border-b pb-3 text-lg font-bold">
          {{ t('clients.settings.internalNotes', 'Internal Notes') }}
        </h2>
        <BaseTextarea
          v-model="notes"
          :label="t('clients.form.notesLabel', 'Internal Client Notes')"
          :placeholder="
            t(
              'clients.form.notesPlaceholder',
              'Contract preferences, invoicing instructions, timezone details...',
            )
          "
          :rows="4"
        />
      </section>

      <!-- Danger Zone -->
      <section class="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
        <h2 class="font-display text-lg font-bold text-rose-600 dark:text-rose-400">
          {{ t('clients.settings.dangerZone', 'Danger Zone') }}
        </h2>
        <p class="text-muted text-xs">
          {{
            t(
              'clients.settings.deleteHelp',
              'Deleting this client will remove their record from your workspace.',
            )
          }}
        </p>

        <BaseButton
          variant="secondary"
          class="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          size="sm"
          @click="isDeleteModalOpen = true"
        >
          <Trash2 class="mr-1.5 h-4 w-4" />
          {{ t('clients.settings.deleteClient', 'Delete Client') }}
        </BaseButton>
      </section>
    </div>

    <!-- Confirm Delete Modal -->
    <BaseModal
      :open="isDeleteModalOpen"
      :title="t('clients.settings.deleteModalTitle', 'Delete Client Record')"
      @close="isDeleteModalOpen = false"
    >
      <p class="text-ink-soft text-sm">
        {{
          t('clients.settings.deleteModalMessage', {
            name: client?.name || '',
          })
        }}
      </p>

      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">
          {{ t('common.actions.cancel', 'Cancel') }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          class="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          :loading="deleteMutation.isPending.value"
          @click="handleDelete"
        >
          {{ t('common.actions.delete', 'Delete') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
