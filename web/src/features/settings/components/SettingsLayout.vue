<script setup lang="ts">
import { Bell, CreditCard, Palette, ShieldCheck, User, Zap } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AccountSecuritySettings from './AccountSecuritySettings.vue'
import AppearanceSettings from './AppearanceSettings.vue'
import BillingSettings from './BillingSettings.vue'
import IntegrationsSettings from './IntegrationsSettings.vue'
import NotificationSettings from './NotificationSettings.vue'
import ProfileSettings from './ProfileSettings.vue'

export type SettingsTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'billing'
  | 'integrations'
  | 'appearance'

const { t } = useI18n()
const activeTab = ref<SettingsTab>('profile')

const navItems: Array<{ id: SettingsTab; labelKey: string; defaultLabel: string; icon: unknown }> = [
  { id: 'profile', labelKey: 'settings.tabs.profile', defaultLabel: 'Profile', icon: User },
  { id: 'security', labelKey: 'settings.tabs.security', defaultLabel: 'Account & Security', icon: ShieldCheck },
  { id: 'notifications', labelKey: 'settings.tabs.notifications', defaultLabel: 'Notifications', icon: Bell },
  { id: 'billing', labelKey: 'settings.tabs.billing', defaultLabel: 'Billing & Plan', icon: CreditCard },
  { id: 'integrations', labelKey: 'settings.tabs.integrations', defaultLabel: 'Integrations', icon: Zap },
  { id: 'appearance', labelKey: 'settings.tabs.appearance', defaultLabel: 'Appearance', icon: Palette },
]
</script>

<template>
  <section class="w-full space-y-6">
    <!-- Main Header -->
    <div>
      <h1 class="font-display text-3xl font-bold tracking-tight text-ink">
        {{ t('settings.title', 'Settings') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.subtitle', 'Manage your profile, security, notifications, billing, and workspace preferences') }}
      </p>
    </div>

    <!-- Mobile Horizontal Tab Bar -->
    <nav class="flex overflow-x-auto gap-2 pb-2 border-b border-border sm:hidden scrollbar-none" aria-label="Settings sub navigation">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition"
        :class="activeTab === item.id ? 'bg-accent text-accent-foreground shadow-sm' : 'bg-canvas text-muted hover:bg-canvas-muted hover:text-ink'"
        @click="activeTab = item.id"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span>{{ t(item.labelKey, item.defaultLabel) }}</span>
      </button>
    </nav>

    <!-- Desktop 2-Column Layout -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
      <!-- Left Sub-Navigation Sidebar -->
      <aside class="hidden w-64 shrink-0 rounded-xl border border-border bg-canvas-elevated p-2 shadow-soft sm:block">
        <nav class="space-y-1" aria-label="Settings navigation">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
            :class="activeTab === item.id ? 'bg-accent/15 text-accent font-semibold' : 'text-ink-soft hover:bg-canvas-muted hover:text-ink'"
            @click="activeTab = item.id"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span>{{ t(item.labelKey, item.defaultLabel) }}</span>
          </button>
        </nav>
      </aside>

      <!-- Right Main Content Panel -->
      <main class="flex-1 rounded-xl border border-border bg-canvas-elevated p-6 shadow-soft">
        <ProfileSettings v-if="activeTab === 'profile'" />
        <AccountSecuritySettings v-else-if="activeTab === 'security'" />
        <NotificationSettings v-else-if="activeTab === 'notifications'" />
        <BillingSettings v-else-if="activeTab === 'billing'" />
        <IntegrationsSettings v-else-if="activeTab === 'integrations'" />
        <AppearanceSettings v-else-if="activeTab === 'appearance'" />
      </main>
    </div>
  </section>
</template>
