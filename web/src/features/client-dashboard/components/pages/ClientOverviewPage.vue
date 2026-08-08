<script setup lang="ts">
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  FileSignature,
  Files,
  FileText,
  Folder,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  StickyNote,
  UserCheck,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { BaseButton, BaseCheckbox, BaseInput, ErrorState, Skeleton } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import type { Project } from '@/features/projects/types'
import { useClientOverviewQuery, useClientQuery, useUpdateClientMutation } from '../../queries'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const clientId = computed(() => String(route.params.id || ''))

// Fetch client detail and overview statistics concurrently
const { data: clientDetailData, isPending: isClientPending, isError: isClientError, refetch: refetchClient } = useClientQuery(clientId)
const { data: overviewData, refetch: refetchOverview } = useClientOverviewQuery(clientId)

const client = computed(() => overviewData.value?.client || clientDetailData.value)
const stats = computed(() => overviewData.value?.stats || {
  active_projects_count: 0,
  total_projects_count: 0,
  pending_proposals_count: 0,
  signed_contracts_count: 0,
  total_budget: 0,
})
const recentProjects = computed<Project[]>(() => (overviewData.value?.recent_projects as Project[]) ?? [])

const isPending = computed(() => isClientPending.value && !client.value)
const isError = computed(() => isClientError.value && !client.value)

const updateClient = useUpdateClientMutation()

const portalPasscode = ref(client.value?.portal_passcode || '')
const isPasswordProtected = ref(client.value?.is_portal_password_protected || false)
const isCopiedPortalLink = ref(false)

watch(
  client,
  (c) => {
    if (c) {
      portalPasscode.value = c.portal_passcode || ''
      isPasswordProtected.value = c.is_portal_password_protected || false
    }
  },
  { immediate: true },
)

const portalShareUrl = computed(() => {
  if (!client.value?.portal_token) return ''
  return `${window.location.origin}/portal/${client.value.portal_token}`
})

function handleCopyPortalLink() {
  if (!portalShareUrl.value) return
  void navigator.clipboard.writeText(portalShareUrl.value)
  isCopiedPortalLink.value = true
  toast.success('Client Portal share link copied!')
  setTimeout(() => {
    isCopiedPortalLink.value = false
  }, 2500)
}

async function handleSavePortalSettings() {
  if (!clientId.value) return
  try {
    await updateClient.mutateAsync({
      id: clientId.value,
      is_portal_password_protected: isPasswordProtected.value,
      portal_passcode: portalPasscode.value.trim(),
    })
    toast.success('Client portal security settings updated!')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function handleRetry() {
  void refetchClient()
  void refetchOverview()
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr.split('T')[0] ?? dateStr
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateStr.split('T')[0] ?? dateStr
  }
}

const clientInitials = computed(() => {
  if (!client.value?.name) return 'CL'
  const parts = client.value.name.trim().split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return client.value.name.substring(0, 2).toUpperCase()
})

const statusColorClass = computed(() => {
  switch (client.value?.status) {
    case 'ACTIVE':
      return 'bg-accent/15 text-accent border-accent/30'
    case 'COMPLETED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    case 'PROPOSAL_SENT':
    case 'NEGOTIATING':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case 'LEAD':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case 'ARCHIVED':
    default:
      return 'bg-canvas-muted text-muted border-border'
  }
})

const hasAnyMetadata = computed(() => {
  if (!client.value) return false
  return !!(
    client.value.email ||
    client.value.phone ||
    client.value.location ||
    client.value.industry ||
    client.value.website ||
    client.value.start_date ||
    client.value.created_at
  )
})

const formattedCreatedDate = computed(() => formatDate(client.value?.created_at))
const formattedStartDate = computed(() => formatDate(client.value?.start_date))

const formattedTotalBudget = computed(() => {
  const amount = stats.value?.total_budget ?? 0
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})

const quickAccessItems = computed(() => {
  const id = clientId.value
  const base = `/app/clients/${id}`
  return [
    {
      title: t('common.clients.nav.projects', 'Projects'),
      description: 'Manage client projects, track milestones, and review deliverables.',
      path: `${base}/projects`,
      icon: Folder,
      colorClass: 'text-accent bg-accent/15 border-accent/20',
      count: `${stats.value?.active_projects_count ?? 0} Active`,
    },
    {
      title: t('common.clients.nav.proposals', 'Proposals'),
      description: 'Draft, send, and review proposals sent to this client.',
      path: `${base}/proposals`,
      icon: FileText,
      colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/15 border-purple-500/20',
      count: `${stats.value?.pending_proposals_count ?? 0} Proposals`,
    },
    {
      title: t('common.clients.nav.contracts', 'Contracts'),
      description: 'Manage signed legal contracts, scopes, and e-signatures.',
      path: `${base}/contracts`,
      icon: FileSignature,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
      count: `${stats.value?.signed_contracts_count ?? 0} Contracts`,
    },
    {
      title: t('common.clients.nav.invoices', 'Invoices'),
      description: 'Issue invoices, log payments, and view billing history.',
      path: `${base}/invoices`,
      icon: CreditCard,
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/20',
      count: formattedTotalBudget.value,
    },
    {
      title: t('common.clients.nav.notes', 'Notes'),
      description: 'Manage meeting notes, client communication logs, and memos.',
      path: `${base}/notes`,
      icon: StickyNote,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/15 border-blue-500/20',
      count: 'Notes & Memos',
    },
    {
      title: t('common.clients.nav.files', 'Files'),
      description: 'Store client assets, contract attachments, and design deliverables.',
      path: `${base}/files`,
      icon: Files,
      colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/15 border-teal-500/20',
      count: 'Files & Assets',
    },
  ]
})
</script>

<template>
  <!-- Loading State -->
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-48 w-full rounded-2xl" />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-36 rounded-xl" />
    </div>
  </div>

  <!-- Error State -->
  <ErrorState
    v-else-if="isError"
    class="mt-6"
    :title="t('common.errors.generic', 'Failed to load client workspace details')"
    :message="t('common.errors.network', 'Please check your connection and try again.')"
    :retry-label="t('common.actions.retry', 'Try again')"
    @retry="handleRetry"
  />

  <!-- Success Loaded State -->
  <div v-else-if="client" class="space-y-8">
    <!-- Structured Client Profile Header Banner -->
    <div class="relative overflow-hidden rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft md:p-8 space-y-6">
      <div class="blueprint-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />

      <!-- Header Top Row: Avatar, Title, Status & Actions -->
      <div class="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex items-start gap-4">
          <!-- Client Brand Avatar Badge -->
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/20 font-display text-xl font-bold text-accent shadow-sm border border-accent/20">
            {{ clientInitials }}
          </div>

          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                {{ client.name }}
              </h1>
              <span class="rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider" :class="statusColorClass">
                {{ client.status }}
              </span>
            </div>

            <p class="text-sm font-medium text-ink-soft">
              {{ client.company_name || 'Individual Client' }}
            </p>
          </div>
        </div>

        <!-- Header Action CTAs -->
        <div class="flex shrink-0 flex-wrap items-center gap-3">
          <BaseButton variant="secondary" size="sm" @click="toast.info('Client editor opened.')">
            Edit Details
          </BaseButton>
          <RouterLink :to="`/app/clients/${clientId}/invoices`">
            <BaseButton size="sm">
              <Plus class="h-4 w-4" />
              <span>Create Invoice</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <template v-if="hasAnyMetadata">
        <hr class="border-border/60" />

        <!-- Structured Client Metadata Grid (Only Present Fields Rendered) -->
        <div class="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1 text-xs">
          <!-- Email -->
          <div v-if="client.email" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <Mail class="h-3.5 w-3.5 text-accent" />
              Email Address
            </span>
            <p class="font-semibold text-ink truncate" :title="client.email">
              {{ client.email }}
            </p>
          </div>

          <!-- Phone -->
          <div v-if="client.phone" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <Phone class="h-3.5 w-3.5 text-accent" />
              Phone Number
            </span>
            <p class="font-semibold text-ink truncate" :title="client.phone">
              {{ client.phone }}
            </p>
          </div>

          <!-- Location -->
          <div v-if="client.location" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <MapPin class="h-3.5 w-3.5 text-accent" />
              Location
            </span>
            <p class="font-semibold text-ink truncate" :title="client.location">
              {{ client.location }}
            </p>
          </div>

          <!-- Industry -->
          <div v-if="client.industry" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <Building2 class="h-3.5 w-3.5 text-accent" />
              Industry
            </span>
            <p class="font-semibold text-ink truncate" :title="client.industry">
              {{ client.industry }}
            </p>
          </div>

          <!-- Website -->
          <div v-if="client.website" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <Globe class="h-3.5 w-3.5 text-accent" />
              Website
            </span>
            <div class="truncate">
              <a
                :href="client.website"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 font-semibold text-accent hover:underline truncate"
              >
                <span class="truncate">{{ client.website }}</span>
                <ExternalLink class="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>

          <!-- Engagement Start Date -->
          <div v-if="client.start_date" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <UserCheck class="h-3.5 w-3.5 text-accent" />
              Engagement Start
            </span>
            <p class="font-semibold text-ink truncate">
              {{ formattedStartDate }}
            </p>
          </div>

          <!-- Date Added / Onboarded -->
          <div v-if="client.created_at" class="rounded-xl border border-border/60 bg-canvas p-3.5 space-y-1">
            <span class="text-muted font-medium flex items-center gap-1.5">
              <Calendar class="h-3.5 w-3.5 text-accent" />
              Date Added
            </span>
            <p class="font-semibold text-ink truncate">
              {{ formattedCreatedDate }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Client Portal Security & Share Access Card -->
    <div v-if="client?.portal_token" class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <div>
            <h3 class="font-display text-base font-bold text-ink">
              Client Portal Access & Passcode Security
            </h3>
            <p class="text-xs text-muted">
              Share a secure VIP portal link with {{ client.name }} to review proposals, suggest revisions, and track progress
            </p>
          </div>
        </div>

        <a
          :href="portalShareUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline shrink-0"
        >
          <span>Preview Portal</span>
          <ExternalLink class="h-3.5 w-3.5" />
        </a>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
        <!-- Portal URL Display + 1-Click Copy -->
        <div class="lg:col-span-7 space-y-1.5">
          <label class="block text-xs font-semibold text-muted">Shareable Portal Link</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="portalShareUrl"
              class="w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-xs text-ink focus:outline-none select-all"
            />
            <BaseButton
              variant="secondary"
              size="sm"
              class="shrink-0"
              @click="handleCopyPortalLink"
            >
              <Check v-if="isCopiedPortalLink" class="h-3.5 w-3.5 text-accent" />
              <Copy v-else class="h-3.5 w-3.5" />
              <span>{{ isCopiedPortalLink ? 'Copied' : 'Copy Link' }}</span>
            </BaseButton>
          </div>
        </div>

        <!-- Password Protection Toggle & Passcode Field -->
        <div class="lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Lock class="h-3.5 w-3.5 text-accent" />
              Passcode Protect Portal
            </label>
            <BaseCheckbox
              v-model="isPasswordProtected"
              label=""
            />
          </div>

          <div v-if="isPasswordProtected" class="flex items-center gap-2">
            <BaseInput
              v-model="portalPasscode"
              label=""
              type="password"
              placeholder="Set passcode (e.g. Rookie2026!)"
              class="flex-1"
            />
            <BaseButton
              size="sm"
              :loading="updateClient.isPending.value"
              @click="handleSavePortalSettings"
            >
              Save Passcode
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary KPI Metric Cards (4 Columns) -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Active Projects KPI -->
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted">Active Projects</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Folder class="h-4 w-4" />
          </div>
        </div>
        <p class="mt-3 text-2xl font-bold text-ink">{{ stats?.active_projects_count ?? 0 }}</p>
        <p class="mt-1 text-xs text-muted font-medium">Out of {{ stats?.total_projects_count ?? 0 }} total projects</p>
      </div>

      <!-- Pending Proposals KPI -->
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted">Proposals</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <FileText class="h-4 w-4" />
          </div>
        </div>
        <p class="mt-3 text-2xl font-bold text-ink">{{ stats?.pending_proposals_count ?? 0 }}</p>
        <p class="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">Drafted or sent proposals</p>
      </div>

      <!-- Signed Contracts KPI -->
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted">Signed Contracts</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <FileSignature class="h-4 w-4" />
          </div>
        </div>
        <p class="mt-3 text-2xl font-bold text-ink">{{ stats?.signed_contracts_count ?? 0 }}</p>
        <p class="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active legal agreements</p>
      </div>

      <!-- Total Budget KPI -->
      <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted">Total Client Value</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <CreditCard class="h-4 w-4" />
          </div>
        </div>
        <p class="mt-3 text-2xl font-bold text-ink">{{ formattedTotalBudget }}</p>
        <p class="mt-1 text-xs text-muted font-medium">Added on {{ formattedCreatedDate || 'N/A' }}</p>
      </div>
    </div>

    <!-- Quick Access Actions Grid -->
    <div class="space-y-4">
      <div>
        <h2 class="font-display text-xl font-bold text-ink">
          Client Sections
        </h2>
        <p class="mt-0.5 text-xs text-muted">
          Quick shortcuts to manage this client's workspace sections
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="item in quickAccessItems"
          :key="item.path"
          :to="item.path"
          class="group relative flex flex-col justify-between rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
        >
          <div>
            <div class="flex items-center justify-between">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105"
                :class="item.colorClass"
              >
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <span class="rounded-full bg-canvas-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft border border-border">
                {{ item.count }}
              </span>
            </div>

            <h3 class="mt-4 font-display text-base font-semibold text-ink transition-colors group-hover:text-accent">
              {{ item.title }}
            </h3>
            <p class="mt-1 text-xs text-muted leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <div class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent transition-all group-hover:gap-2">
            <span>Manage Section</span>
            <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Bottom Section: Active Projects Preview & Client Notes -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- Active Projects Preview (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-ink">
            Client Projects
          </h2>
          <RouterLink :to="`/app/clients/${clientId}/projects`" class="text-xs font-semibold text-accent hover:underline">
            View All Projects →
          </RouterLink>
        </div>

        <div v-if="recentProjects.length === 0" class="rounded-xl border border-border bg-canvas-elevated p-6 text-center text-xs text-muted shadow-soft">
          No projects created for this client yet.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-display text-base font-semibold text-ink">
                  {{ project.title }}
                </h3>
                <p v-if="project.summary" class="text-xs text-muted mt-0.5 line-clamp-1">
                  {{ project.summary }}
                </p>
              </div>
              <span class="shrink-0 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                {{ project.status }}
              </span>
            </div>

            <div class="flex items-center justify-between text-xs text-muted pt-1">
              <span v-if="project.due_date" class="inline-flex items-center gap-1">
                <Clock class="h-3.5 w-3.5 text-muted" />
                <span>Due Date: {{ project.due_date }}</span>
              </span>
              <span v-if="project.budget" class="font-semibold text-ink">
                ${{ Number(project.budget).toLocaleString() }}
              </span>
              <RouterLink :to="`/app/projects/${project.id}/overview`" class="text-accent font-medium hover:underline">
                View Project Dashboard →
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Client Notes Section (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-ink">
            Client Notes & Memos
          </h2>
          <RouterLink :to="`/app/clients/${clientId}/notes`" class="text-xs font-semibold text-accent hover:underline">
            Manage Notes →
          </RouterLink>
        </div>

        <div class="rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft space-y-3 text-xs">
          <p v-if="client.notes" class="text-ink-soft whitespace-pre-wrap leading-relaxed">
            {{ client.notes }}
          </p>
          <p v-else class="text-muted italic">
            No notes added for this client yet. Click "Edit Details" to add notes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
