<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  to?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  to: '/app',
  subtitle: undefined,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex items-center gap-2.5 transition focus:outline-none"
    @click="(e) => emit('click', e)"
  >
    <!-- Logo Badge Box -->
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold font-display text-lg shadow-sm transition-transform group-hover:scale-105">
      W
    </div>

    <!-- Title & Optional Subtitle -->
    <div class="flex flex-col">
      <span class="font-display font-bold text-lg leading-tight tracking-tight text-ink">
        Winlance
      </span>
      <span
        v-if="subtitle"
        class="text-[10px] font-semibold tracking-wider text-accent uppercase leading-none mt-0.5"
      >
        {{ subtitle }}
      </span>
    </div>
  </RouterLink>
</template>
