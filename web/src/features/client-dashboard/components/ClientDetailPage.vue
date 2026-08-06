<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'


const route = useRoute()
const clientId = route.params.id as string
const { t } = useI18n()

// placeholder data fetch – replace with real API call
const client = { id: clientId, name: 'Client ' + clientId, description: 'Demo client details.' }
</script>

<template>
  <section class="mx-auto w-full max-w-2xl rounded-xl border border-border bg-canvas-elevated p-8 shadow-lift">
    <h1 class="font-display text-3xl text-ink">{{ t('client.detail.title') }}: {{ client.name }}</h1>
    <p class="mt-2 text-sm text-muted">{{ client.description }}</p>
    <!-- Add more client detail sections here -->
  </section>
</template>

<style scoped>
/* Premium subtle styling */
</style>
