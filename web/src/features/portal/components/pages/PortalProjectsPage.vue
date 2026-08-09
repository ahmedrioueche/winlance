<script setup lang="ts">
import {
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
} from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { usePortalInfoQuery } from '../../queries'

const { t } = useI18n()
const route = useRoute()
const token = computed(() => String(route.params.token || ''))

const { data: portalInfo } = usePortalInfoQuery(token)
</script>

<template>
  <section class="space-y-6">
    <!-- Section Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
          {{ t('portal.projects.title', 'Projects & Milestones') }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ t('portal.projects.subtitle', 'Active project progress and deliverable tracking') }} {{ portalInfo?.company_name || portalInfo?.client_name || '' }}
        </p>
      </div>
    </div>

    <!-- Active Projects Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Project 1 Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
              <FolderKanban class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-display text-base font-bold text-ink">
                Enterprise ERP Platform v1
              </h3>
              <p class="text-xs text-muted">Web Application & Administrative Dashboard</p>
            </div>
          </div>
          <span class="rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent uppercase">
            {{ t('portal.projects.inProgress', 'In Progress') }}
          </span>
        </div>

        <!-- Progress Bar Indicator -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-ink">{{ t('portal.projects.milestoneProgress', 'Milestones Progress') }}</span>
            <span class="font-bold text-accent">{{ t('portal.projects.complete', { percent: 65 }) }}</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-accent rounded-full transition-all duration-500 w-[65%]" />
          </div>
        </div>

        <!-- Milestones Checklist -->
        <div class="space-y-2 pt-2 border-t border-border/60 text-xs">
          <div class="flex items-center justify-between py-1 text-ink">
            <span class="flex items-center gap-2 font-medium">
              <CheckCircle2 class="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Milestone 1: Discovery, Architecture & Wireframes</span>
            </span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ t('portal.projects.delivered', 'Delivered') }}</span>
          </div>

          <div class="flex items-center justify-between py-1 text-ink">
            <span class="flex items-center gap-2 font-medium">
              <Clock class="h-4 w-4 text-accent shrink-0" />
              <span>Milestone 2: Core Platform & Proposal Engine</span>
            </span>
            <span class="text-accent font-semibold">{{ t('portal.projects.inProgress', 'In Progress') }}</span>
          </div>

          <div class="flex items-center justify-between py-1 text-muted">
            <span class="flex items-center gap-2">
              <Calendar class="h-4 w-4 text-muted/60 shrink-0" />
              <span>Milestone 3: Client Portal & QA Launch</span>
            </span>
            <span>{{ t('portal.projects.upcoming', 'Upcoming') }}</span>
          </div>
        </div>
      </div>

      <!-- Project 2 Card -->
      <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <FolderKanban class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-display text-base font-bold text-ink">
                Brand System & Design Tokens
              </h3>
              <p class="text-xs text-muted">Visual Identity & Component Guidelines</p>
            </div>
          </div>
          <span class="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            {{ t('portal.projects.delivered', 'Delivered') }}
          </span>
        </div>

        <!-- Progress Bar Indicator -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-ink">{{ t('portal.projects.milestoneProgress', 'Milestones Progress') }}</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ t('portal.projects.complete', { percent: 100 }) }}</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-500 w-full" />
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-border/60 text-xs">
          <div class="flex items-center justify-between py-1 text-ink">
            <span class="flex items-center gap-2 font-medium">
              <CheckCircle2 class="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Milestone 1: Design Tokens & Typography Scale</span>
            </span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ t('portal.projects.delivered', 'Delivered') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
