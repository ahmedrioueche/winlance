<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { BasePageHeader } from '@/shared/components/base'
import ChecklistsPanel from './ChecklistsPanel.vue'
import SequencesPanel from './SequencesPanel.vue'
import TagsPanel from './TagsPanel.vue'
import TemplatesPanel from './TemplatesPanel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

type Tab = 'templates' | 'sequences' | 'checklists' | 'tags'

const tabs: { id: Tab; labelKey: string }[] = [
  { id: 'templates', labelKey: 'outreach.tabs.templates' },
  { id: 'sequences', labelKey: 'outreach.tabs.sequences' },
  { id: 'checklists', labelKey: 'outreach.tabs.checklists' },
  { id: 'tags', labelKey: 'outreach.tabs.tags' },
]

const tab = ref<Tab>('templates')

watch(
  () => route.query.tab,
  (value) => {
    if (value === 'templates' || value === 'sequences' || value === 'checklists' || value === 'tags') {
      tab.value = value
    }
  },
  { immediate: true },
)

async function setTab(next: Tab) {
  tab.value = next
  await router.replace({ query: { ...route.query, tab: next } })
}
</script>

<template>
  <section class="w-full space-y-8">
    <BasePageHeader
      :title="t('outreach.title')"
      :subtitle="t('outreach.subtitle')"
    />

    <div
      class="flex flex-wrap gap-2 border-b border-border pb-3"
      role="tablist"
      :aria-label="t('outreach.tabs.label')"
    >
      <button
        v-for="item in tabs"
        :key="item.id"
        type="button"
        role="tab"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="
          tab === item.id
            ? 'bg-accent text-accent-foreground'
            : 'text-ink-soft hover:bg-canvas-muted hover:text-ink'
        "
        :aria-selected="tab === item.id"
        @click="setTab(item.id)"
      >
        {{ t(item.labelKey) }}
      </button>
    </div>

    <TemplatesPanel v-if="tab === 'templates'" />
    <SequencesPanel v-else-if="tab === 'sequences'" />
    <ChecklistsPanel v-else-if="tab === 'checklists'" />
    <TagsPanel v-else />
  </section>
</template>
