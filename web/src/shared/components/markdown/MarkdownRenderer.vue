<script setup lang="ts">
import { computed } from 'vue'

import { parseMarkdownToHtml } from '@/shared/utils/markdown'

const props = defineProps<{
  content: string | null | undefined
}>()

const renderedHtml = computed(() => parseMarkdownToHtml(props.content))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="markdown-renderer font-mono text-sm leading-relaxed text-ink"
    v-html="renderedHtml"
  />
</template>

<style scoped>
.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3) {
  scroll-margin-top: 5rem;
}
</style>
