/**
 * Accessible modal dialog.
 * @slots header | default (body) | footer
 * @emits close
 */
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  open: boolean
  title: string
  /** When true, clicking the backdrop does not close. */
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
})

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape' && !props.persistent) {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusable = dialogRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocused.value = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      dialogRef.value?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused.value?.focus()
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-page"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-overlay"
        aria-hidden="true"
        @click="persistent ? undefined : close()"
      />
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        class="relative z-10 w-full max-w-lg rounded-xl border border-border bg-canvas-elevated p-6 shadow-lift outline-none"
      >
        <header class="mb-4 flex items-start justify-between gap-4">
          <h2 class="font-display text-xl text-ink">
            <slot name="header">{{ title }}</slot>
          </h2>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-sm text-muted hover:bg-canvas-muted hover:text-ink"
            :aria-label="title"
            @click="close"
          >
            ✕
          </button>
        </header>
        <div class="text-ink-soft">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="mt-6 flex flex-wrap justify-end gap-2">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
