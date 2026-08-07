<script setup lang="ts">
import { Download } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import { BaseButton } from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

const { t } = useI18n()
const toast = useToast()

const invoices = [
  { id: 'INV-2026-008', date: 'Aug 1, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2026-007', date: 'Jul 1, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2026-006', date: 'Jun 1, 2026', amount: '$49.00', status: 'Paid' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink">
        {{ t('settings.billing.title', 'Billing & Subscription') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.billing.subtitle', 'Manage your plan, quotas, payment methods, and invoices') }}
      </p>
    </div>

    <!-- Active Plan Card -->
    <div class="flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent-soft/30 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span class="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent uppercase tracking-wider">
          Active Plan
        </span>
        <h3 class="font-display text-2xl font-bold text-ink mt-2">
          {{ t('settings.billing.currentPlan', 'Pro Freelancer Plan') }}
        </h3>
        <p class="text-xs text-muted mt-0.5">
          $49.00 / month • {{ t('settings.billing.renewDate', 'Renews on Sept 1, 2026') }}
        </p>
      </div>

      <BaseButton class="shrink-0" @click="toast.success('Upgrade options selected.')">
        {{ t('settings.billing.upgradePlan', 'Upgrade Plan') }}
      </BaseButton>
    </div>

    <!-- Usage Quotas -->
    <div class="rounded-xl border border-border bg-canvas p-5 space-y-4">
      <h3 class="font-display text-base font-semibold text-ink">
        {{ t('settings.billing.usageTitle', 'Monthly Quota Usage') }}
      </h3>

      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs text-ink-soft mb-1 font-medium">
            <span>Active Projects</span>
            <span>12 / Unlimited</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-accent w-[40%]" />
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs text-ink-soft mb-1 font-medium">
            <span>Client Portals</span>
            <span>8 / 25 Portals</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-emerald-500 w-[32%]" />
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs text-ink-soft mb-1 font-medium">
            <span>AI Coach Queries</span>
            <span>142 / 500 Queries</span>
          </div>
          <div class="h-2 w-full rounded-full bg-canvas-muted overflow-hidden">
            <div class="h-full bg-purple-500 w-[28%]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="rounded-xl border border-border bg-canvas p-5 space-y-3">
      <h3 class="font-display text-base font-semibold text-ink">
        {{ t('settings.billing.invoices', 'Billing History') }}
      </h3>

      <div class="divide-y divide-border/60">
        <div v-for="inv in invoices" :key="inv.id" class="flex items-center justify-between py-2.5 text-xs">
          <div>
            <p class="font-medium text-ink-soft">{{ inv.id }}</p>
            <p class="text-muted">{{ inv.date }}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="font-semibold text-ink">{{ inv.amount }}</span>
            <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {{ inv.status }}
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-accent hover:underline font-medium"
              @click="toast.success(`Downloading ${inv.id}...`)"
            >
              <Download class="h-3.5 w-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
