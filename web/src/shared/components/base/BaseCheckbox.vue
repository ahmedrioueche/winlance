/**
 * Accessible custom styled checkbox with primary color when checked.
 * Uses `defineModel` for v-model binding.
 */
<script setup lang="ts">
import { Check, Minus } from '@lucide/vue'
import { computed, ref, useId, watch } from 'vue'

interface Props {
  label?: string
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  indeterminate: false,
})

const model = defineModel<boolean>({ default: false })
const generatedId = useId()
const inputId = computed(() => `checkbox-${generatedId}`)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.indeterminate,
  (value) => {
    if (inputRef.value) inputRef.value.indeterminate = value
  },
  { immediate: true },
)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  model.value = target.checked
}
</script>

<template>
  <label
    class="group inline-flex cursor-pointer items-center gap-2.5 select-none text-sm text-ink"
    :class="disabled && 'cursor-not-allowed opacity-60'"
    :for="inputId"
  >
    <div class="relative flex items-center justify-center">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="sr-only"
        :checked="model"
        :disabled="disabled"
        @change="onChange"
      />
      <div
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150 outline-none group-focus-within:ring-2 group-focus-within:ring-ring/40"
        :class="[
          model || indeterminate
            ? 'border-accent bg-accent text-accent-foreground shadow-sm'
            : 'border-border bg-canvas text-transparent group-hover:border-accent/60',
        ]"
      >
        <Minus v-if="indeterminate" class="h-3.5 w-3.5 stroke-[3]" />
        <Check v-else-if="model" class="h-3.5 w-3.5 stroke-[3]" />
      </div>
    </div>
    <span v-if="label" class="font-medium text-ink-soft group-hover:text-ink transition-colors">
      {{ label }}
    </span>
  </label>
</template>
