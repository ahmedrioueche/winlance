/**
 * Lightweight, XSS-safe Markdown to HTML parser for Winlance proposals.
 * Supports:
 * - Headings: # H1, ## H2, ### H3
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Strikethrough: ~~text~~
 * - Blockquotes: > quote text
 * - Bullet lists: - item or * item
 * - Numbered lists: 1. item
 * - Horizontal rules: --- or ***
 * - Code: `code`
 * - Links: [label](url)
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function parseMarkdownToHtml(markdown: string | null | undefined): string {
  if (!markdown) return ''

  // 1. Split lines and escape HTML
  const lines = markdown.split(/\r?\n/)
  const processedLines: string[] = []

  let inList = false
  let listType: 'ul' | 'ol' | null = null

  function closeList() {
    if (inList && listType) {
      processedLines.push(`</${listType}>`)
      inList = false
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? ''
    const line = escapeHtml(rawLine.trim())

    // Empty line
    if (!line) {
      closeList()
      processedLines.push('')
      continue
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(---|[*]{3}|_{3})$/.test(line)) {
      closeList()
      processedLines.push('<hr class="my-6 border-border/80" />')
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      closeList()
      const content = parseInlineMarkdown(line.slice(2))
      processedLines.push(`<h1 class="font-display text-2xl font-bold tracking-tight text-ink mt-6 mb-3 border-b border-border/60 pb-2">${content}</h1>`)
      continue
    }

    if (line.startsWith('## ')) {
      closeList()
      const content = parseInlineMarkdown(line.slice(3))
      processedLines.push(`<h2 class="font-display text-xl font-bold tracking-tight text-ink mt-5 mb-2">${content}</h2>`)
      continue
    }

    if (line.startsWith('### ')) {
      closeList()
      const content = parseInlineMarkdown(line.slice(4))
      processedLines.push(`<h3 class="font-display text-base font-bold text-ink mt-4 mb-2">${content}</h3>`)
      continue
    }

    // Blockquote
    if (line.startsWith('&gt; ') || line.startsWith('> ')) {
      closeList()
      const rawQuote = line.replace(/^(&gt;|>)\s*/, '')
      const content = parseInlineMarkdown(rawQuote)
      processedLines.push(`<blockquote class="my-3 border-l-4 border-accent bg-accent-soft px-4 py-3 rounded-r-xl italic text-ink-soft">${content}</blockquote>`)
      continue
    }

    // Bullet List Item (- or *)
    if (/^[-*]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        closeList()
        inList = true
        listType = 'ul'
        processedLines.push('<ul class="my-3 space-y-1.5 list-disc list-inside text-ink-soft">')
      }
      const itemText = parseInlineMarkdown(line.replace(/^[-*]\s+/, ''))
      processedLines.push(`  <li class="leading-relaxed">${itemText}</li>`)
      continue
    }

    // Numbered List Item (1., 2., etc.)
    if (/^\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        closeList()
        inList = true
        listType = 'ol'
        processedLines.push('<ol class="my-3 space-y-1.5 list-decimal list-inside text-ink-soft">')
      }
      const itemText = parseInlineMarkdown(line.replace(/^\d+\.\s+/, ''))
      processedLines.push(`  <li class="leading-relaxed">${itemText}</li>`)
      continue
    }

    // Normal Paragraph
    closeList()
    const content = parseInlineMarkdown(line)
    processedLines.push(`<p class="my-2 leading-relaxed text-ink-soft">${content}</p>`)
  }

  closeList()

  return processedLines.join('\n')
}

/** Parse inline tags: bold, italic, strikethrough, code, links */
function parseInlineMarkdown(text: string): string {
  let result = text

  // Code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="rounded bg-canvas-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-accent border border-border/60">$1</code>')

  // Bold: **bold** or __bold__
  result = result.replace(/(\*\*|__)(.*?)\1/g, '<strong class="font-bold text-ink">$2</strong>')

  // Italic: *italic* or _italic_
  result = result.replace(/(\*|_)(.*?)\1/g, '<em class="italic">$2</em>')

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.*?)~~/g, '<del class="line-through text-muted">$1</del>')

  // Links: [label](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-accent hover:underline me-0.5">$1</a>')

  return result
}
