/**
 * Reusable accessible search input component with search icon and optional clear button.
 */
<script setup lang="ts">
import { computed, useId } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  label?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Search...',
  disabled: false,
  clearable: true,
  size: 'md',
})

const model = defineModel<string>({ default: '' })
const id = `search-input-${useId()}`

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'py-1.5 text-xs h-8'
    case 'lg':
      return 'py-2.5 text-base h-11'
    case 'md':
    default:
      return 'py-2 text-sm h-[38px]'
  }
})

function handleClear() {
  model.value = ''
}
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="block text-sm font-medium text-ink">
      {{ label }}
    </label>

    <div class="relative flex w-full items-center">
      <!-- Search Icon -->
      <Search
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none"
        aria-hidden="true"
      />

      <!-- Input element -->
      <input
        :id="id"
        v-model="model"
        type="search"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="label || placeholder"
        class="w-full rounded-md border border-border bg-canvas pr-8 pl-9 text-ink leading-5 placeholder:text-muted/60 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[sizeClasses]"
      />

      <!-- Clear Button -->
      <button
        v-if="clearable && model"
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted hover:text-ink hover:bg-canvas-muted transition focus:outline-none focus:ring-2 focus:ring-ring/30"
        aria-label="Clear search query"
        @click="handleClear"
      >
        <X class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>
