<script setup lang="ts">
/**
 * Custom select dropdown. Native select option hover cannot be styled.
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const { t } = useI18n()
const model = defineModel<string>({ default: '' })
const id = `select-${useId()}`
const listboxId = `${id}-listbox`

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const optionRefs = ref<HTMLElement[]>([])
const activeIndex = ref(-1)

const emptyLabel = computed(
  () => props.placeholder || props.label || t('common.forms.selectPlaceholder'),
)

const selectedLabel = computed(() => {
  const match = props.options.find((option) => option.value === model.value)
  if (match) return match.label
  return emptyLabel.value
})

const showingPlaceholder = computed(
  () => !props.options.some((option) => option.value === model.value),
)

const selectableIndexes = computed(() =>
  props.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled)
    .map(({ index }) => index),
)

function setOptionRef(el: unknown, index: number) {
  if (el instanceof HTMLElement) {
    optionRefs.value[index] = el
  }
}

function close() {
  open.value = false
  activeIndex.value = -1
}

function toggle() {
  if (props.disabled) return
  if (open.value) {
    close()
    return
  }
  open.value = true
  const selected = props.options.findIndex((option) => option.value === model.value)
  activeIndex.value =
    selected >= 0 && !props.options[selected]?.disabled
      ? selected
      : (selectableIndexes.value[0] ?? -1)
  void nextTick(() => {
    optionRefs.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function selectOption(option: SelectOption) {
  if (option.disabled) return
  model.value = option.value
  close()
  triggerRef.value?.focus()
}

function moveActive(delta: number) {
  const indexes = selectableIndexes.value
  if (indexes.length === 0) return
  const currentPos = indexes.indexOf(activeIndex.value)
  const nextPos =
    currentPos === -1
      ? delta > 0
        ? 0
        : indexes.length - 1
      : (currentPos + delta + indexes.length) % indexes.length
  activeIndex.value = indexes[nextPos] ?? indexes[0]!
  void nextTick(() => {
    optionRefs.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      toggle()
      return
    }
    moveActive(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!open.value) {
      toggle()
      return
    }
    const option = props.options[activeIndex.value]
    if (option) selectOption(option)
    return
  }

  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    close()
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value || !rootRef.value) return
  const target = event.target
  if (target instanceof Node && !rootRef.value.contains(target)) {
    close()
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onDocumentPointerDown)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="rootRef" class="relative space-y-1.5">
    <label class="block text-sm font-medium text-ink" :for="id">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>

    <button
      :id="id"
      ref="triggerRef"
      type="button"
      class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-canvas px-3 py-2 text-left text-ink outline-none transition hover:border-accent hover:bg-accent-soft focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
      :class="error ? 'border-error hover:border-error' : 'border-border'"
      :disabled="disabled"
      :aria-expanded="open"
      :aria-haspopup="'listbox'"
      :aria-controls="listboxId"
      :aria-invalid="error ? true : undefined"
      :aria-required="required || undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span class="truncate" :class="showingPlaceholder && 'text-muted'">
        {{ selectedLabel }}
      </span>
      <span
        class="text-muted transition"
        :class="open && 'rotate-180 text-accent'"
        aria-hidden="true"
      >
        ▾
      </span>
    </button>

    <ul
      v-if="open"
      :id="listboxId"
      role="listbox"
      class="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-canvas-elevated p-1 shadow-lift"
      :aria-labelledby="id"
    >
      <li
        v-for="(option, index) in options"
        :key="option.value"
        :ref="(el) => setOptionRef(el, index)"
        role="option"
        class="cursor-pointer rounded-md px-3 py-2 text-sm transition"
        :class="[
          option.disabled && 'cursor-not-allowed opacity-50',
          !option.disabled &&
            (model === option.value || activeIndex === index
              ? 'bg-accent text-accent-foreground'
              : 'text-ink hover:bg-accent hover:text-accent-foreground'),
        ]"
        :aria-selected="model === option.value"
        :aria-disabled="option.disabled || undefined"
        @mouseenter="!option.disabled && (activeIndex = index)"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>

    <!-- Keep native required validation hook when needed -->
    <input
      v-if="required"
      class="sr-only"
      tabindex="-1"
      :value="model"
      required
      aria-hidden="true"
      @focus="triggerRef?.focus()"
    />

    <p v-if="error" class="text-xs text-error" role="alert">{{ error }}</p>
  </div>
</template>
