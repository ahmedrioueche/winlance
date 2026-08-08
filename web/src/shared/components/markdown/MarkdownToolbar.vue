<script setup lang="ts">
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
} from '@lucide/vue'

const props = defineProps<{
  textareaId?: string
}>()

const emit = defineEmits<{
  format: [type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'quote' | 'hr']
}>()

function handleAction(type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'quote' | 'hr') {
  emit('format', type)

  // If textareaId is provided, perform direct DOM selection manipulation
  if (props.textareaId) {
    const el = document.getElementById(props.textareaId) as HTMLTextAreaElement | null
    if (el) {
      applyFormattingToTextarea(el, type)
    }
  }
}

function applyFormattingToTextarea(
  el: HTMLTextAreaElement,
  type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'quote' | 'hr',
) {
  const start = el.selectionStart
  const end = el.selectionEnd
  const value = el.value
  const selectedText = value.substring(start, end)

  let replacement = ''
  let newStart = start
  let newEnd = end

  switch (type) {
    case 'bold':
      replacement = `**${selectedText || 'bold text'}**`
      newStart = start + 2
      newEnd = start + 2 + (selectedText.length || 9)
      break
    case 'italic':
      replacement = `*${selectedText || 'italic text'}*`
      newStart = start + 1
      newEnd = start + 1 + (selectedText.length || 11)
      break
    case 'h1':
      replacement = `# ${selectedText || 'Heading 1'}`
      newStart = start + 2
      newEnd = start + 2 + (selectedText.length || 9)
      break
    case 'h2':
      replacement = `## ${selectedText || 'Heading 2'}`
      newStart = start + 3
      newEnd = start + 3 + (selectedText.length || 9)
      break
    case 'h3':
      replacement = `### ${selectedText || 'Heading 3'}`
      newStart = start + 4
      newEnd = start + 4 + (selectedText.length || 9)
      break
    case 'bullet':
      replacement = `- ${selectedText || 'List item'}`
      newStart = start + 2
      newEnd = start + 2 + (selectedText.length || 9)
      break
    case 'number':
      replacement = `1. ${selectedText || 'List item'}`
      newStart = start + 3
      newEnd = start + 3 + (selectedText.length || 9)
      break
    case 'quote':
      replacement = `> ${selectedText || 'Quote text'}`
      newStart = start + 2
      newEnd = start + 2 + (selectedText.length || 10)
      break
    case 'hr':
      replacement = `\n---\n`
      newStart = start + 5
      newEnd = start + 5
      break
  }

  el.value = value.substring(0, start) + replacement + value.substring(end)
  el.focus()
  el.setSelectionRange(newStart, newEnd)

  // Dispatch input event for Vue v-model reactivity
  el.dispatchEvent(new Event('input', { bubbles: true }))
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 rounded-xl border border-border/80 bg-canvas-elevated p-1.5 shadow-xs text-xs">
    <!-- Bold -->
    <button
      type="button"
      title="Bold (**text**)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted font-bold text-ink transition-colors"
      @click="handleAction('bold')"
    >
      <Bold class="h-3.5 w-3.5" />
    </button>

    <!-- Italic -->
    <button
      type="button"
      title="Italic (*text*)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted text-ink transition-colors"
      @click="handleAction('italic')"
    >
      <Italic class="h-3.5 w-3.5" />
    </button>

    <div class="h-4 w-px bg-border/60 mx-1" />

    <!-- Headings -->
    <button
      type="button"
      title="Heading 1 (# Text)"
      class="flex h-8 px-2 items-center gap-1 rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted font-bold text-ink transition-colors"
      @click="handleAction('h1')"
    >
      <Heading1 class="h-3.5 w-3.5 text-accent" />
      <span class="text-[11px]">H1</span>
    </button>

    <button
      type="button"
      title="Heading 2 (## Text)"
      class="flex h-8 px-2 items-center gap-1 rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted font-bold text-ink transition-colors"
      @click="handleAction('h2')"
    >
      <Heading2 class="h-3.5 w-3.5 text-accent" />
      <span class="text-[11px]">H2</span>
    </button>

    <button
      type="button"
      title="Heading 3 (### Text)"
      class="flex h-8 px-2 items-center gap-1 rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted font-bold text-ink transition-colors"
      @click="handleAction('h3')"
    >
      <Heading3 class="h-3.5 w-3.5 text-accent" />
      <span class="text-[11px]">H3</span>
    </button>

    <div class="h-4 w-px bg-border/60 mx-1" />

    <!-- Lists -->
    <button
      type="button"
      title="Bullet List (- item)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted text-ink transition-colors"
      @click="handleAction('bullet')"
    >
      <List class="h-3.5 w-3.5" />
    </button>

    <button
      type="button"
      title="Numbered List (1. item)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted text-ink transition-colors"
      @click="handleAction('number')"
    >
      <ListOrdered class="h-3.5 w-3.5" />
    </button>

    <!-- Blockquote -->
    <button
      type="button"
      title="Quote (> quote)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted text-ink transition-colors"
      @click="handleAction('quote')"
    >
      <Quote class="h-3.5 w-3.5" />
    </button>

    <!-- Horizontal Rule -->
    <button
      type="button"
      title="Divider (---)"
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-canvas hover:border-border hover:bg-canvas-muted text-ink transition-colors"
      @click="handleAction('hr')"
    >
      <Minus class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
