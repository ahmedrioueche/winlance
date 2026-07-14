/**
 * Textarea with associated label.
 */
<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label: string
  rows?: number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
})

const model = defineModel<string>({ default: '' })
const id = `textarea-${useId()}`
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-ink" :for="id">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? true : undefined"
      class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
      :class="error && 'border-error'"
    />
    <p v-if="error" class="text-xs text-error" role="alert">{{ error }}</p>
  </div>
</template>
