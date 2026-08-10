<script setup lang="ts">
import { ChevronDown, Eye, GitCompare, History, Search, X } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProposalVersion } from '../../types'

interface Props {
  versions: ProposalVersion[]
  viewingVersionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  versions: () => [],
  viewingVersionId: null,
})

const emit = defineEmits<{
  view: [ver: ProposalVersion]
  compare: [ver: ProposalVersion]
  close: []
}>()

const { d } = useI18n()

const versionSearch = ref('')
const versionRoleFilter = ref<'all' | 'freelancer' | 'client'>('all')
const showAllVersions = ref(false)

const filteredVersions = computed(() => {
  let list = props.versions

  if (versionRoleFilter.value !== 'all') {
    list = list.filter((v) => v.created_by_role === versionRoleFilter.value)
  }

  if (versionSearch.value.trim()) {
    const q = versionSearch.value.trim().toLowerCase()
    list = list.filter(
      (v) =>
        `v${v.version_number}`.toLowerCase().includes(q) ||
        (v.change_summary || '').toLowerCase().includes(q) ||
        (v.created_by_role || '').toLowerCase().includes(q),
    )
  }

  return list
})

const visibleVersions = computed(() => {
  if (
    props.versions.length <= 5 ||
    showAllVersions.value ||
    versionSearch.value.trim() ||
    versionRoleFilter.value !== 'all'
  ) {
    return filteredVersions.value
  }
  return filteredVersions.value.slice(0, 5)
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return d(new Date(dateStr), 'short')
  } catch {
    return dateStr.split('T')[0] ?? ''
  }
}

function formatAuthor(ver: ProposalVersion): string {
  const name = ver.created_by_name || ver.created_by_role
  if (ver.created_by_role === 'client' && ver.created_by_name) {
    return `${ver.created_by_name} (Client)`
  }
  return name
}
</script>

<template>
  <div class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft space-y-4">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between border-b border-border/60 pb-3">
      <span class="font-display text-sm font-bold text-ink flex items-center gap-1.5">
        <History class="h-4 w-4 text-accent" />
        Version History
        <span v-if="versions.length > 0" class="text-muted font-normal">({{ versions.length }})</span>
      </span>
      <button
        type="button"
        class="rounded-lg p-1 text-muted hover:bg-canvas-muted hover:text-ink transition-colors"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Search & Filter Controls (Only rendered if versions.length > 5) -->
    <div v-if="versions.length > 5" class="space-y-2 border-b border-border/60 pb-3">
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        <input
          v-model="versionSearch"
          type="text"
          placeholder="Search versions..."
          class="w-full rounded-lg border border-border bg-canvas pl-8 pr-3 py-1 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-1 rounded-lg border border-border bg-canvas p-0.5 text-[11px]">
        <button
          type="button"
          class="flex-1 rounded-md py-0.5 font-medium text-center transition-colors"
          :class="versionRoleFilter === 'all' ? 'bg-accent text-accent-contrast font-semibold' : 'text-muted hover:text-ink'"
          @click="versionRoleFilter = 'all'"
        >
          All ({{ versions.length }})
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-0.5 font-medium text-center transition-colors"
          :class="versionRoleFilter === 'freelancer' ? 'bg-accent text-accent-contrast font-semibold' : 'text-muted hover:text-ink'"
          @click="versionRoleFilter = 'freelancer'"
        >
          Freelancer
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-0.5 font-medium text-center transition-colors"
          :class="versionRoleFilter === 'client' ? 'bg-purple-600 text-white font-semibold' : 'text-muted hover:text-ink'"
          @click="versionRoleFilter = 'client'"
        >
          Client
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="versions.length === 0"
      class="rounded-lg border border-border bg-canvas p-5 text-center space-y-1"
    >
      <p class="text-sm font-medium text-muted">No versions yet</p>
      <p class="text-xs text-muted/70 leading-relaxed">
        Versions are created when you publish or save changes to a published proposal.
      </p>
    </div>

    <div
      v-else-if="filteredVersions.length === 0"
      class="rounded-lg border border-border bg-canvas p-4 text-center text-xs text-muted"
    >
      No matching versions found.
    </div>

    <!-- Version Cards -->
    <div v-else class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
      <div
        v-for="ver in visibleVersions"
        :key="ver.id"
        class="rounded-lg border p-3.5 text-xs transition-all duration-150"
        :class="
          viewingVersionId === ver.id
            ? 'border-accent bg-accent-soft shadow-sm'
            : 'border-border bg-canvas hover:border-accent/30'
        "
      >
        <!-- Version Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-ink">v{{ ver.version_number }}</span>
            <span
              v-if="viewingVersionId === ver.id"
              class="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase"
            >
              Viewing
            </span>
            <span
              v-else-if="ver.version_number === versions[0]?.version_number"
              class="text-[10px] font-normal text-muted"
            >
              (latest)
            </span>
          </div>
          <span
            class="rounded bg-canvas-muted px-2 py-0.5 text-[10px] font-medium uppercase"
            :class="ver.created_by_role === 'client' ? 'text-purple-600 dark:text-purple-400' : 'text-muted'"
          >
            {{ ver.created_by_role }}
          </span>
        </div>

        <!-- Version Info -->
        <p class="text-ink-soft mt-1.5 font-medium truncate">
          "{{ ver.change_summary }}"
        </p>
        <p class="text-muted mt-0.5">
          {{ formatAuthor(ver) }} · {{ formatDate(ver.created_at) }}
        </p>

        <!-- Actions -->
        <div class="mt-2.5 pt-2 border-t border-border/60 flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
            @click="emit('view', ver)"
          >
            <Eye class="h-3 w-3" />
            <span>View</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
            @click="emit('compare', ver)"
          >
            <GitCompare class="h-3 w-3" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      <!-- Show Older Versions Expand Button -->
      <div v-if="versions.length > 5 && !showAllVersions && !versionSearch && versionRoleFilter === 'all'" class="pt-2 text-center border-t border-border/60">
        <button
          type="button"
          class="text-xs font-semibold text-accent hover:underline flex items-center justify-center gap-1 mx-auto"
          @click="showAllVersions = true"
        >
          <span>Show older versions ({{ versions.length - 5 }} remaining)</span>
          <ChevronDown class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
