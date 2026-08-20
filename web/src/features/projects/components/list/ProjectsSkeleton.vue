<script setup lang="ts">
import { Skeleton } from '@/shared/components/base'
</script>

<template>
  <!-- Grid Skeleton -->
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
    <Skeleton v-for="i in 6" :key="i" class="h-52 rounded-xl" />
  </div>
</template>
