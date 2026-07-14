/**
 * Select with associated label.
 */
<script setup lang="ts">
import { useId } from 'vue'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  label: string
  options: SelectOption[]
  disabled?: boolean
  required?: boolean
  error?: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const model = defineModel<string>({ default: '' })
const id = `select-${useId()}`
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-ink" :for="id">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>
    <select
      :id="id"
      v-model="model"
      :disabled="disabled"
      :required="required"
      class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
      :class="error && 'border-error'"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-xs text-error" role="alert">{{ error }}</p>
  </div>
</template>
