<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ErrorState, Skeleton } from '@/shared/components/base'
import { useClientOverviewData } from '../../composables/overview/useClientOverviewData'
import ClientOverviewHeader from '../overview/ClientOverviewHeader.vue'
import ClientOverviewMetrics from '../overview/ClientOverviewMetrics.vue'
import ClientOverviewProjectsWidget from '../overview/ClientOverviewProjectsWidget.vue'
import ClientOverviewProposalsWidget from '../overview/ClientOverviewProposalsWidget.vue'

const route = useRoute()
const clientId = computed(() => String(route.params.id || ''))

const {
  client,
  isPending,
  isError,
  refetch,
  projects,
  proposals,
  activeProjectsCount,
  totalProposalsCount,
  winRatePercent,
  totalRevenue,
  formatCurrency,
  handleCopyPortalLink,
} = useClientOverviewData(clientId)
</script>

<template>
  <div v-if="isPending" class="space-y-6">
    <Skeleton class="h-32 w-full rounded-2xl" />
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>
    <Skeleton class="h-96 w-full rounded-2xl" />
  </div>

  <ErrorState
    v-else-if="isError"
    title="Failed to load client details"
    retry-label="Try again"
    @retry="refetch()"
  />

  <section v-else class="space-y-8">
    <ClientOverviewHeader
      :client="client"
      :client-id="clientId"
      @copy-portal-link="handleCopyPortalLink"
    />

    <ClientOverviewMetrics
      :total-revenue-formatted="formatCurrency(totalRevenue, 'USD')"
      :active-projects-count="activeProjectsCount"
      :total-proposals-count="totalProposalsCount"
      :win-rate-percent="winRatePercent"
    />

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <ClientOverviewProjectsWidget
        :projects="projects"
        :client-id="clientId"
      />

      <ClientOverviewProposalsWidget
        :proposals="proposals"
        :client-id="clientId"
      />
    </div>
  </section>
</template>
