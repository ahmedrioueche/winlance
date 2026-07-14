/**
 * Accessible checkbox with optional indeterminate state.
 * Uses `defineModel` for v-model binding.
 */
<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

interface Props {
  label: string
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
    class="inline-flex cursor-pointer items-start gap-2 text-sm text-ink"
    :class="disabled && 'cursor-not-allowed opacity-60'"
    :for="inputId"
  >
    <input
      :id="inputId"
      ref="inputRef"
      type="checkbox"
      class="mt-0.5 size-4 rounded-sm border-border accent-accent"
      :checked="model"
      :disabled="disabled"
      @change="onChange"
    />
    <span>{{ label }}</span>
  </label>
</template>
