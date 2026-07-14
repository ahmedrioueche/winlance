/**
 * Text input with associated label.
 */
<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const model = defineModel<string>({ default: '' })
const id = `input-${useId()}`
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-ink" :for="id">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      class="w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
      :class="error && 'border-error'"
    />
    <p v-if="hint && !error" :id="`${id}-hint`" class="text-xs text-muted">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-xs text-error" role="alert">{{ error }}</p>
  </div>
</template>
