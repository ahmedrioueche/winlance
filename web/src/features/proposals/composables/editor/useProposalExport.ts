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
  expiresAt?: string | null
  addons?: any[]
  signedAt?: string | null
  signedName?: string
  signedEmail?: string
  signedIp?: string
  status?: string
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHtml(data: ProposalExportData): string {
  const milestoneSum = data.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  const addonsList = data.addons || []
  const selectedAddonsSum = addonsList
    .filter(a => a.is_selected)
    .reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
  const totalAmount = (Number(data.amount) || 0) + selectedAddonsSum

  const milestonesHtml = data.milestones.length > 0
    ? data.milestones.map((m, idx) => {
      const deliverablesList = (m.deliverables || [])
        .filter(d => d.trim())
        .map(d => `<li style="margin-bottom:4px;">${escapeHtml(d)}</li>`)
        .join('')

      return `
      <div class="milestone-card">
        <div class="milestone-header">
          <div>
            <div class="milestone-badge">Phase ${idx + 1}</div>
            <div class="milestone-title">${escapeHtml(m.title || `Phase ${idx + 1}`)}</div>
          </div>
          ${Number(m.amount) ? `<div class="milestone-amount">${formatCurrency(m.amount, data.currency)}</div>` : ''}
        </div>
        ${m.description?.trim() ? `<div class="milestone-desc">${escapeHtml(m.description)}</div>` : ''}
        ${deliverablesList ? `
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 6px;">Deliverables:</div>
          <ul class="deliverables-list">${deliverablesList}</ul>
        </div>
        ` : ''}
      </div>`
    }).join('')
    : ''

  const addonsHtml = addonsList.length > 0
    ? `
    <div class="section">
      <div class="section-heading">
        <h2>Optional Add-ons &amp; Services</h2>
      </div>
      <div class="addons-list">
        ${addonsList.map(a => `
          <div style="border: 1px solid #e8e8f0; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; background: ${a.is_selected ? '#f8f5ff' : '#ffffff'};">
            <div>
              <strong style="font-size: 11px; color: #1a1a2e;">${escapeHtml(a.title)} ${a.is_selected ? '<span style="color:#6366f1; font-size:10px;">[SELECTED]</span>' : ''}</strong>
              ${a.description ? `<p style="font-size:10px; color:#666; margin: 2px 0 0 0;">${escapeHtml(a.description)}</p>` : ''}
            </div>
            <span style="font-size: 11px; font-weight: bold; color: #6366f1;">+${formatCurrency(a.amount, data.currency)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    `
    : ''

  const auditTrailHtml = (data.status === 'ACCEPTED' || data.signedAt)
    ? `
    <div class="section" style="border: 1px solid #10b981; background: #ecfdf5; padding: 16px; border-radius: 12px; margin-top: 24px;">
      <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 13px;">ELECTRONIC SIGNATURE AUDIT CERTIFICATE</h3>
      <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
        <tr><td style="padding: 3px 0; color: #666;">Signer Name:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedName || 'Authorized Signer')}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">Signer Email:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedEmail || 'N/A')}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">Signed Date:</td><td style="font-weight: bold; color: #111;">${formatDate(data.signedAt || undefined)}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">IP Address:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedIp || '127.0.0.1')}</td></tr>
      </table>
    </div>
    `
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    font-size: 12px;
    line-height: 1.6;
    padding: 0;
    margin: 0;
  }
  .page { padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 28px; }
  .header-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 4px; }
  h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.25; }
  .header-meta { display: flex; gap: 24px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .meta-item { display: flex; flex-direction: column; }
  .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; }
  .meta-value { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
  .meta-value.accent { color: #6366f1; font-size: 14px; }
  .section { margin-bottom: 28px; }
  .section-heading { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; }
  .section-number { background: #6366f1; color: #ffffff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
  h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
  .summary-text { background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; color: #334155; white-space: pre-wrap; font-size: 11px; }
  .milestones-summary { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 12px; font-weight: 600; }
  .milestone-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; background: #ffffff; }
  .milestone-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .milestone-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #6366f1; background: #eeeffe; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }
  .milestone-title { font-size: 12px; font-weight: 700; color: #0f172a; }
  .milestone-amount { font-size: 12px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0; }
  .milestone-desc { font-size: 11px; color: #64748b; margin-top: 4px; }
  .deliverables-list { margin: 0; padding-left: 16px; font-size: 10.5px; color: #334155; }
  .body-content { font-size: 11px; color: #334155; line-height: 1.6; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-label">Project Proposal</div>
    <h1>${escapeHtml(data.title || 'Untitled Proposal')}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <span class="meta-label">Total Investment</span>
        <span class="meta-value accent">${formatCurrency(totalAmount, data.currency)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date Created</span>
        <span class="meta-value">${formatDate(data.createdAt)}</span>
      </div>
      ${data.expiresAt ? `
      <div class="meta-item">
        <span class="meta-label">Valid Until</span>
        <span class="meta-value" style="color:#d97706;">${formatDate(data.expiresAt)}</span>
      </div>
      ` : ''}
      <div class="meta-item">
        <span class="meta-label">Milestones</span>
        <span class="meta-value">${data.milestones.length}</span>
      </div>
    </div>
  </div>

  ${data.summary.trim() ? `
  <div class="section">
    <div class="section-heading">
      <span class="section-number">1</span>
      <h2>Executive Summary</h2>
    </div>
    <div class="summary-text">${escapeHtml(data.summary)}</div>
  </div>
  ` : ''}

  ${data.milestones.length > 0 ? `
  <div class="section">
    <div class="section-heading">
      <span class="section-number">2</span>
      <h2>Milestones &amp; Deliverables</h2>
    </div>
    ${milestonesHtml}
  </div>
  ` : ''}

  ${addonsHtml}

  ${data.body.trim() ? `
  <div class="section">
    <div class="section-heading">
      <span class="section-number">${data.milestones.length > 0 ? '3' : '2'}</span>
      <h2>Scope Terms &amp; Next Steps</h2>
    </div>
    <div class="body-content">${renderMarkdown(data.body)}</div>
  </div>
  ` : ''}

  ${auditTrailHtml}

  <div class="footer">
    Generated on ${formatDate()} &middot; Confidential Proposal Document &middot; Winlance Platform
  </div>
</div>
</body>
</html>`
}

export function useProposalExport() {
  const isExporting = ref(false)

  async function exportPdf(data: ProposalExportData) {
    isExporting.value = true
    let iframe: HTMLIFrameElement | null = null
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const html = buildHtml(data)

      // Create an isolated hidden iframe to render the PDF HTML without affecting host DOM styles
      iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.left = '-9999px'
      iframe.style.top = '0'
      iframe.style.width = '800px'
      iframe.style.height = '1000px'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document')
      }

      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()

      // Allow fonts and layout to render inside iframe
      await new Promise(resolve => setTimeout(resolve, 250))

      const pageContent = (iframeDoc.querySelector('.page') || iframeDoc.body) as HTMLElement

      const filename = `${(data.title || 'proposal').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`

      await (html2pdf() as any)
        .set({
          margin: [10, 0, 10, 0],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            windowWidth: 800,
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
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
      isExporting.value = false
    }
  }

  return { exportPdf, isExporting }
}
