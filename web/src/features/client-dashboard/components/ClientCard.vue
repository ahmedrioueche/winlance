<script setup lang="ts">
import { Building2, Calendar, Globe, Mail, MapPin, Phone } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import type { Client } from '../types'

interface Props {
  client: Client
}

const props = defineProps<Props>()
const { t, d } = useI18n()

const statusColorClass = computed(() => {
  switch (props.client.status) {
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

const statusLabel = computed(() => {
  const key = `clients.status.${props.client.status.toLowerCase()}`
  return t(key, props.client.status)
})

const formattedCreatedDate = computed(() => {
  if (!props.client.created_at) return ''
  try {
    return d(new Date(props.client.created_at), 'short')
  } catch {
    return props.client.created_at.split('T')[0] ?? ''
  }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'client-detail', params: { id: client.id } }"
    class="group relative flex flex-col justify-between rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <div>
      <!-- Top Row: Name, Company & Status -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-display text-lg font-semibold text-ink transition-colors group-hover:text-accent line-clamp-1">
            {{ client.name }}
          </h3>
          <p class="text-xs text-muted font-medium mt-0.5">
            {{ client.company_name || t('clients.noCompany', 'Individual Client') }}
          </p>
        </div>

        <span
          class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider"
          :class="statusColorClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Contact Info -->
      <div class="mt-4 space-y-1.5 text-xs text-muted">
        <div v-if="client.email" class="flex items-center gap-2 truncate">
          <Mail class="h-3.5 w-3.5 shrink-0 text-muted" />
          <span class="truncate">{{ client.email }}</span>
        </div>
        <div v-if="client.phone" class="flex items-center gap-2">
          <Phone class="h-3.5 w-3.5 shrink-0 text-muted" />
          <span>{{ client.phone }}</span>
        </div>
      </div>

      <!-- Location & Industry Tags -->
      <div v-if="client.location || client.industry || client.website" class="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          v-if="client.location"
          class="inline-flex items-center gap-1.5 rounded-md bg-canvas-muted px-2 py-0.5 text-[11px] font-medium text-ink-soft border border-border"
        >
          <MapPin class="h-3 w-3 text-muted" />
          <span>{{ client.location }}</span>
        </span>
        <span
          v-if="client.industry"
          class="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent border border-accent/20"
        >
          <Building2 class="h-3 w-3 text-accent" />
          <span>{{ client.industry }}</span>
        </span>
        <a
          v-if="client.website"
          :href="client.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-md bg-canvas-muted px-2 py-0.5 text-[11px] font-medium text-muted hover:text-accent border border-border transition-colors"
          @click.stop
        >
          <Globe class="h-3 w-3 text-muted" />
          <span>{{ t('clients.fields.website', 'Website') }}</span>
        </a>
      </div>
    </div>

    <!-- Bottom Row: Date Added -->
    <div class="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
      <span v-if="formattedCreatedDate" class="inline-flex items-center gap-1.5 text-[11px]">
        <Calendar class="h-3.5 w-3.5 text-muted" />
        <span>{{ t('clients.addedDate', { date: formattedCreatedDate }) }}</span>
      </span>
      <span class="text-accent font-medium text-[11px] group-hover:underline">
        View Client →
      </span>
    </div>
  </RouterLink>
</template>
