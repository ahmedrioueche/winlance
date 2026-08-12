import { ref } from 'vue'
import { marked } from 'marked'
import type { ProposalMilestoneItem } from '../../components/editor/ProposalEditorMilestonesSection.vue'

export interface ProposalExportData {
  title: string
  summary: string
  body: string
  amount: number | string | null
  currency: string
  milestones: ProposalMilestoneItem[]
  createdAt?: string
}

function formatCurrency(value: number | string | null | undefined, currency = 'USD'): string {
  const num = Number(value) || 0
  return num.toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  })
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderMarkdown(md: string): string {
  if (!md.trim()) return ''
  return marked.parse(md, { async: false }) as string
}

function buildHtml(data: ProposalExportData): string {
  const milestoneSum = data.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)

  const milestonesHtml = data.milestones.length > 0
    ? data.milestones.map((m, idx) => {
      const deliverablesList = (m.deliverables || [])
        .filter(d => d.trim())
        .map(d => `<li>${escapeHtml(d)}</li>`)
        .join('')

      return `
        <div class="milestone">
          <div class="milestone-header">
            <span class="milestone-phase">Phase ${idx + 1}</span>
            <h3 class="milestone-title">${escapeHtml(m.title)}</h3>
            ${Number(m.amount) ? `<span class="milestone-budget">${formatCurrency(m.amount, data.currency)}</span>` : ''}
          </div>
          ${m.description ? `<p class="milestone-desc">${escapeHtml(m.description)}</p>` : ''}
          ${deliverablesList ? `
            <div class="deliverables">
              <span class="deliverables-label">Deliverables</span>
              <ul>${deliverablesList}</ul>
            </div>
          ` : ''}
        </div>
      `
    }).join('')
    : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.6;
    font-size: 13px;
  }

  .page {
    max-width: 800px;
    margin: 0 auto;
    padding: 48px 40px;
  }

  /* ── Header ── */
  .header {
    border-bottom: 2px solid #e8e8f0;
    padding-bottom: 28px;
    margin-bottom: 32px;
  }

  .header-label {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #8888a0;
    margin-bottom: 8px;
  }

  .header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.25;
    margin-bottom: 16px;
  }

  .header-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #8888a0;
    font-weight: 600;
  }

  .meta-value {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .meta-value.accent {
    color: #6366f1;
  }

  /* ── Sections ── */
  .section {
    margin-bottom: 32px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eeeef5;
  }

  .section-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #6366f1;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .section-heading h2 {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .summary-text {
    font-size: 13.5px;
    line-height: 1.75;
    color: #33334d;
    white-space: pre-wrap;
  }

  /* ── Milestones ── */
  .milestone {
    background: #f9f9fc;
    border: 1px solid #e8e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 14px;
    page-break-inside: avoid;
  }

  .milestone-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .milestone-phase {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 700;
    color: #6366f1;
    background: #ededfc;
    padding: 3px 10px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .milestone-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    flex: 1;
  }

  .milestone-budget {
    font-size: 14px;
    font-weight: 700;
    color: #059669;
    flex-shrink: 0;
  }

  .milestone-desc {
    font-size: 13px;
    color: #555;
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .deliverables {
    border-top: 1px solid #e8e8f0;
    padding-top: 10px;
  }

  .deliverables-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    color: #8888a0;
    display: block;
    margin-bottom: 6px;
  }

  .deliverables ul {
    list-style: none;
    padding: 0;
  }

  .deliverables li {
    position: relative;
    padding-left: 22px;
    font-size: 12.5px;
    color: #33334d;
    margin-bottom: 5px;
    line-height: 1.5;
  }

  .deliverables li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #6366f1;
    font-weight: 700;
    font-size: 13px;
  }

  /* ── Milestone Summary Bar ── */
  .milestones-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #6366f1;
    color: #fff;
    padding: 14px 20px;
    border-radius: 10px;
    margin-bottom: 18px;
    font-size: 13px;
  }

  .milestones-summary strong {
    font-size: 15px;
  }

  /* ── Body / Terms (rendered markdown) ── */
  .body-content {
    font-size: 13px;
    line-height: 1.75;
    color: #33334d;
  }

  .body-content h1, .body-content h2, .body-content h3 {
    color: #1a1a2e;
    margin-top: 18px;
    margin-bottom: 8px;
  }

  .body-content h3 { font-size: 14px; }
  .body-content h2 { font-size: 15px; }
  .body-content h1 { font-size: 17px; }

  .body-content ul, .body-content ol {
    padding-left: 20px;
    margin-bottom: 12px;
  }

  .body-content li {
    margin-bottom: 4px;
  }

  .body-content p {
    margin-bottom: 10px;
  }

  .body-content strong {
    font-weight: 600;
    color: #1a1a2e;
  }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid #e8e8f0;
    padding-top: 16px;
    margin-top: 40px;
    text-align: center;
    font-size: 10px;
    color: #aaa;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-label">Project Proposal</div>
    <h1>${escapeHtml(data.title || 'Untitled Proposal')}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <span class="meta-label">Total Budget</span>
        <span class="meta-value accent">${formatCurrency(data.amount, data.currency)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Currency</span>
        <span class="meta-value">${data.currency || 'USD'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">${formatDate(data.createdAt)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Milestones</span>
        <span class="meta-value">${data.milestones.length}</span>
      </div>
    </div>
  </div>

  ${data.summary.trim() ? `
  <!-- Section 1: Executive Summary -->
  <div class="section">
    <div class="section-heading">
      <span class="section-number">1</span>
      <h2>Executive Summary</h2>
    </div>
    <div class="summary-text">${escapeHtml(data.summary)}</div>
  </div>
  ` : ''}

  ${data.milestones.length > 0 ? `
  <!-- Section 2: Milestones & Deliverables -->
  <div class="section">
    <div class="section-heading">
      <span class="section-number">2</span>
      <h2>Milestones &amp; Deliverables</h2>
    </div>
    ${milestoneSum > 0 ? `
    <div class="milestones-summary">
      <span>${data.milestones.length} milestone phase${data.milestones.length > 1 ? 's' : ''}</span>
      <strong>${formatCurrency(milestoneSum, data.currency)}</strong>
    </div>
    ` : ''}
    ${milestonesHtml}
  </div>
  ` : ''}

  ${data.body.trim() ? `
  <!-- Section 3: Scope Terms & Next Steps -->
  <div class="section">
    <div class="section-heading">
      <span class="section-number">${data.milestones.length > 0 ? '3' : '2'}</span>
      <h2>Scope Terms &amp; Next Steps</h2>
    </div>
    <div class="body-content">${renderMarkdown(data.body)}</div>
  </div>
  ` : ''}

  <div class="footer">
    Generated on ${formatDate()} &middot; This document is confidential and intended solely for the named recipient.
  </div>
</div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function useProposalExport() {
  const isExporting = ref(false)

  async function exportPdf(data: ProposalExportData) {
    isExporting.value = true
    try {
      const html2pdf = (await import('html2pdf.js')).default

      const html = buildHtml(data)

      // Create a temporary container to render the HTML
      const container = document.createElement('div')
      container.innerHTML = html
      // Extract just the body content for html2pdf
      const pageContent = container.querySelector('.page') || container
      document.body.appendChild(container)
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '800px'

      const filename = `${(data.title || 'proposal').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`

      await html2pdf()
        .set({
          margin: [10, 0, 10, 0],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(pageContent)
        .save()

      document.body.removeChild(container)
    } finally {
      isExporting.value = false
    }
  }

  return { exportPdf, isExporting }
}
