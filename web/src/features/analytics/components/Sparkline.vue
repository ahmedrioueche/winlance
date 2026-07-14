<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  values: number[]
  label: string
}

const props = defineProps<Props>()

const points = computed(() => {
  const values = props.values.length ? props.values : [0]
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <div class="space-y-2" role="img" :aria-label="label">
    <svg viewBox="0 0 100 40" class="h-10 w-full text-accent" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
        :points="points"
      />
    </svg>
  </div>
</template>
