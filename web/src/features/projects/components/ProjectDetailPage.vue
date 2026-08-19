<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseTextarea,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreateFileMutation,
  useCreateReportMutation,
  useCreateShareLinkMutation,
  useFilesQuery,
  useMilestonesQuery,
  useProjectQuery,
  useReportsQuery,
  useRequirementsQuery,
  useShareLinksQuery,
} from '../queries'

const { t } = useI18n()
const toast = useToast()
const id = computed(() => String(useRoute().params.id))

const projectQuery = useProjectQuery(id)
const shareLinksQuery = useShareLinksQuery(id)
const requirementsQuery = useRequirementsQuery(id)
const milestonesQuery = useMilestonesQuery(id)
const filesQuery = useFilesQuery(id)
const reportsQuery = useReportsQuery(id)

const createShareLink = useCreateShareLinkMutation()
const createFile = useCreateFileMutation()
const createReport = useCreateReportMutation()

const project = computed(() => projectQuery.data.value)
const shareLinks = computed(() => shareLinksQuery.data.value ?? [])
const requirementItems = computed(() => requirementsQuery.data.value ?? [])
const milestoneItems = computed(() => milestonesQuery.data.value ?? [])
const fileItems = computed(() => filesQuery.data.value ?? [])
const reportItems = computed(() => reportsQuery.data.value ?? [])

const fileName = ref('')
const fileUrl = ref('')
const reportTitle = ref('')
const reportBody = ref('')
const reportVisible = ref(true)

async function share() {
  try {
    const link = await createShareLink.mutateAsync({ id: id.value })
    await navigator.clipboard.writeText(`${window.location.origin}/portal/${link.token}`)
    toast.success('projects.messages.copied')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function addFile() {
  try {
    await createFile.mutateAsync({
      id: id.value,
      name: fileName.value,
      url: fileUrl.value,
    })
    fileName.value = ''
    fileUrl.value = ''
    toast.success('projects.messages.fileAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function addReport() {
  try {
    await createReport.mutateAsync({
      id: id.value,
      title: reportTitle.value,
      body: reportBody.value,
      is_visible_to_client: reportVisible.value,
    })
    reportTitle.value = ''
    reportBody.value = ''
    reportVisible.value = true
    toast.success('projects.messages.reportAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="w-full space-y-8">
    <div id="overview" class="flex flex-wrap items-start justify-between gap-4 scroll-mt-20">
      <div>
        <h1 class="font-display text-3xl text-ink">{{ project?.title || t('projects.detail', 'Project Detail') }}</h1>
        <p v-if="project?.summary" class="mt-2 text-ink-soft">{{ project.summary }}</p>
      </div>
      <BaseButton v-if="project" :loading="createShareLink.isPending.value" @click="share">
        {{ t('projects.share') }}
      </BaseButton>
    </div>

    <LoadingState v-if="projectQuery.isPending.value" />
    <ErrorState
      v-else-if="projectQuery.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="projectQuery.refetch()"
    />
    <article v-else-if="project" class="space-y-8">

      <section id="share" class="scroll-mt-20 space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('projects.shareLinks') }}</h2>
        <EmptyState
          v-if="!shareLinks.length"
          :title="t('projects.emptyShare')"
          :description="t('projects.emptyShareHint')"
        />
        <ul v-else class="space-y-2">
          <li
            v-for="link in shareLinks"
            :key="link.token"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm text-ink-soft"
          >
            /portal/{{ link.token }}
          </li>
        </ul>
      </section>

      <section id="requirements" class="scroll-mt-20 space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('projects.requirements') }}</h2>
        <EmptyState v-if="!requirementItems.length" :title="t('projects.emptyRequirements')" />
        <ul v-else class="space-y-2">
          <li
            v-for="item in requirementItems"
            :key="item.id"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2"
          >
            <p class="font-medium text-ink">{{ item.title }}</p>
            <p class="text-sm text-muted">{{ item.description }}</p>
          </li>
        </ul>
      </section>

      <section id="milestones" class="scroll-mt-20 space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('projects.milestones') }}</h2>
        <EmptyState v-if="!milestoneItems.length" :title="t('projects.emptyMilestones')" />
        <ul v-else class="space-y-2">
          <li
            v-for="item in milestoneItems"
            :key="item.id"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2"
          >
            <p class="font-medium text-ink">{{ item.title }}</p>
            <p class="text-sm text-muted">{{ item.status }} · {{ item.progress_percent }}%</p>
          </li>
        </ul>
      </section>

      <section id="files" class="scroll-mt-20 space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('projects.files') }}</h2>
        <EmptyState v-if="!fileItems.length" :title="t('projects.emptyFiles')" />
        <ul v-else class="space-y-2">
          <li
            v-for="file in fileItems"
            :key="file.id"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2 text-sm"
          >
            <a
              v-if="file.url"
              class="font-medium text-ink underline-offset-2 hover:underline"
              :href="file.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ file.name }}
            </a>
            <span v-else class="font-medium text-ink">{{ file.name }}</span>
            <p class="text-muted">{{ file.notes }}</p>
          </li>
        </ul>
        <div class="grid gap-3 sm:grid-cols-2">
          <BaseInput v-model="fileName" :label="t('projects.fileName')" />
          <BaseInput v-model="fileUrl" :label="t('projects.fileUrl')" />
        </div>
        <BaseButton :loading="createFile.isPending.value" @click="addFile">
          {{ t('projects.addFile') }}
        </BaseButton>
      </section>

      <section id="reports" class="scroll-mt-20 space-y-3">
        <h2 class="font-display text-xl text-ink">{{ t('projects.reports') }}</h2>
        <EmptyState v-if="!reportItems.length" :title="t('projects.emptyReports')" />
        <ul v-else class="space-y-2">
          <li
            v-for="report in reportItems"
            :key="report.id"
            class="rounded-md border border-border bg-canvas-elevated px-3 py-2"
          >
            <p class="font-medium text-ink">{{ report.title }}</p>
            <p class="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{{ report.body }}</p>
          </li>
        </ul>
        <BaseInput v-model="reportTitle" :label="t('projects.reportTitle')" />
        <BaseTextarea v-model="reportBody" :label="t('projects.reportBody')" :rows="4" />
        <BaseCheckbox v-model="reportVisible" :label="t('projects.reportVisible')" />
        <BaseButton :loading="createReport.isPending.value" @click="addReport">
          {{ t('projects.addReport') }}
        </BaseButton>
      </section>
    </article>
  </section>
</template>
