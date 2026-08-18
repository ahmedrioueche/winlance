<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderKanban,
  ListChecks,
  Paperclip,
} from 'lucide-vue-next'

import {
  BaseButton,
  BasePageHeader,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/shared/components/base'

import { usePortalProjectQuery } from '../../queries'

const { t, d } = useI18n()
const route = useRoute()
const router = useRouter()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const activeTab = ref<'milestones' | 'files' | 'reports' | 'scope'>('milestones')
const {
  data: project,
  isPending,
  isError,
  refetch,
} = usePortalProjectQuery(token, projectId)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr
  }
}

function getMilestoneStatusBadgeClass(status: string) {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    case 'IN_PROGRESS':
      return 'bg-accent/15 border-accent/30 text-accent'
    case 'BLOCKED':
      return 'bg-error/15 border-error/30 text-error'
    case 'PENDING':
    default:
      return 'bg-canvas-muted border-border text-muted'
  }
}

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'DONE':
      return CheckCircle2
    case 'IN_PROGRESS':
      return Clock
    default:
      return Calendar
  }
}
</script>

<template>
  <section class="space-y-6">
    <!-- Top Back Navigation -->
    <div>
      <BaseButton
        variant="secondary"
        size="sm"
        @click="router.push(`/portal/${token}/projects`)"
      >
        <ArrowLeft class="h-4 w-4" />
        <span>{{ t('portal.projects.backToProjects', 'Back to Projects') }}</span>
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="space-y-6">
      <Skeleton class="h-48 w-full rounded-2xl" />
      <Skeleton class="h-96 w-full rounded-2xl" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="isError || !project"
      :title="t('portal.projects.detailErrorTitle', 'Failed to load project details')"
      :message="t('portal.projects.detailErrorMessage', 'We could not load details for this project. It may have been archived or removed.')"
      :retry-label="t('common.actions.retry', 'Try again')"
      @retry="refetch()"
    />

    <template v-else>
      <!-- Project Header Card -->
      <BasePageHeader
        :title="project.title"
        :subtitle="project.summary || t('portal.projects.defaultSummary', 'Project workspace overview, milestone deliverables, and status updates.')"
      >
        <template #badge>
          <span class="rounded-full border border-accent/30 bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent uppercase">
            {{ project.status }}
          </span>
        </template>

        <template #actions>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span v-if="project.start_date" class="hidden sm:inline">
              Started: {{ formatDate(project.start_date) }}
            </span>
            <span v-if="project.due_date" class="font-semibold text-ink">
              Due: {{ formatDate(project.due_date) }}
            </span>
          </div>
        </template>

        <template #meta>
          <!-- Milestone Progress Bar -->
          <div class="space-y-1.5 pt-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-ink">
                {{ t('portal.projects.milestoneProgress', 'Milestone Completion') }}
              </span>
              <span class="font-bold text-accent">
                {{ project.progress_percent ?? 0 }}%
              </span>
            </div>
            <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
              <div
                class="h-full bg-accent rounded-full transition-all duration-500"
                :style="{ width: `${project.progress_percent ?? 0}%` }"
              />
            </div>
          </div>
        </template>
      </BasePageHeader>

      <!-- Tabs Navigation -->
      <div class="border-b border-border flex items-center gap-2 text-xs">
        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-colors"
          :class="
            activeTab === 'milestones'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          "
          @click="activeTab = 'milestones'"
        >
          <FolderKanban class="h-4 w-4" />
          <span>{{ t('portal.projects.tabs.milestones', 'Milestones') }}</span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-bold">
            {{ project.milestones?.length || 0 }}
          </span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-colors"
          :class="
            activeTab === 'files'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          "
          @click="activeTab = 'files'"
        >
          <Paperclip class="h-4 w-4" />
          <span>{{ t('portal.projects.tabs.files', 'Shared Files') }}</span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-bold">
            {{ project.files?.length || 0 }}
          </span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-colors"
          :class="
            activeTab === 'reports'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          "
          @click="activeTab = 'reports'"
        >
          <FileText class="h-4 w-4" />
          <span>{{ t('portal.projects.tabs.reports', 'Status Reports') }}</span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-bold">
            {{ project.reports?.length || 0 }}
          </span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-colors"
          :class="
            activeTab === 'scope'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          "
          @click="activeTab = 'scope'"
        >
          <ListChecks class="h-4 w-4" />
          <span>{{ t('portal.projects.tabs.scope', 'Scope & Requirements') }}</span>
          <span class="rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-bold">
            {{ project.requirements?.length || 0 }}
          </span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="mt-6">
        <!-- 1. Milestones Tab -->
        <div v-if="activeTab === 'milestones'" class="space-y-4">
          <EmptyState
            v-if="!project.milestones || project.milestones.length === 0"
            :title="t('portal.projects.noMilestonesTitle', 'No Milestones Set')"
            :description="t('portal.projects.noMilestonesDescription', 'No project milestones have been created for this workspace yet.')"
          />

          <div v-else class="space-y-3">
            <div
              v-for="m in project.milestones"
              :key="m.id"
              class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-start gap-3">
                <component
                  :is="getMilestoneIcon(m.status)"
                  class="h-5 w-5 shrink-0 mt-0.5"
                  :class="m.status === 'DONE' ? 'text-emerald-500' : 'text-accent'"
                />
                <div>
                  <h4 class="font-display text-sm font-semibold text-ink">
                    {{ m.title }}
                  </h4>
                  <p v-if="m.description" class="mt-0.5 text-xs text-muted">
                    {{ m.description }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0 text-xs ml-8 sm:ml-0">
                <span v-if="m.due_date" class="text-muted">
                  Due: {{ formatDate(m.due_date) }}
                </span>
                <span
                  class="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase"
                  :class="getMilestoneStatusBadgeClass(m.status)"
                >
                  {{ m.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Shared Files Tab -->
        <div v-else-if="activeTab === 'files'" class="space-y-4">
          <EmptyState
            v-if="!project.files || project.files.length === 0"
            :title="t('portal.projects.noFilesTitle', 'No Shared Files')"
            :description="t('portal.projects.noFilesDescription', 'No deliverables or attachments have been shared for this project yet.')"
          />

          <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              v-for="f in project.files"
              :key="f.id"
              class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3 truncate">
                <Paperclip class="h-5 w-5 text-accent shrink-0" />
                <div class="truncate">
                  <h4 class="font-medium text-xs text-ink truncate">
                    {{ f.name }}
                  </h4>
                  <p v-if="f.notes" class="text-[11px] text-muted truncate">
                    {{ f.notes }}
                  </p>
                </div>
              </div>

              <a
                v-if="f.url"
                :href="f.url"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0"
              >
                <BaseButton variant="secondary" size="sm">
                  <Download class="h-3.5 w-3.5" />
                  <span>Download</span>
                </BaseButton>
              </a>
            </div>
          </div>
        </div>

        <!-- 3. Status Reports Tab -->
        <div v-else-if="activeTab === 'reports'" class="space-y-4">
          <EmptyState
            v-if="!project.reports || project.reports.length === 0"
            :title="t('portal.projects.noReportsTitle', 'No Status Reports')"
            :description="t('portal.projects.noReportsDescription', 'No client status updates or progress reports have been published yet.')"
          />

          <div v-else class="space-y-4">
            <div
              v-for="r in project.reports"
              :key="r.id"
              class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-3"
            >
              <div class="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                <h4 class="font-display text-base font-bold text-ink">
                  {{ r.title }}
                </h4>
                <span v-if="r.created_at" class="text-xs text-muted font-mono">
                  {{ formatDate(r.created_at) }}
                </span>
              </div>
              <p class="text-xs text-ink-soft whitespace-pre-line leading-relaxed">
                {{ r.body }}
              </p>
            </div>
          </div>
        </div>

        <!-- 4. Scope & Requirements Tab -->
        <div v-else-if="activeTab === 'scope'" class="space-y-4">
          <EmptyState
            v-if="!project.requirements || project.requirements.length === 0"
            :title="t('portal.projects.noScopeTitle', 'No Requirements Defined')"
            :description="t('portal.projects.noScopeDescription', 'No specific project requirements or scope items have been listed.')"
          />

          <div v-else class="space-y-3">
            <div
              v-for="req in project.requirements"
              :key="req.id"
              class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft flex items-start gap-3 text-xs"
            >
              <ListChecks class="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 class="font-semibold text-ink">
                  {{ req.title }}
                </h4>
                <p v-if="req.description" class="mt-1 text-muted">
                  {{ req.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
