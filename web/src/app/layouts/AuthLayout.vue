<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { ThemeToggle } from '@/shared/components/base'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="flex items-center justify-between px-page py-6">
      <RouterLink class="font-display text-xl text-ink" to="/">
        Winlance
      </RouterLink>
      <ThemeToggle />
    </header>
    <main class="flex flex-1 items-center px-page pb-16">
      <slot />
    </main>
  </div>
</template>
