import { ref } from 'vue'
import { marked } from 'marked'

export interface ContractExportData {
  title: string
  body: string
  amount?: number | string | null
  currency?: string
  status?: string
  signedAt?: string | null
  signedName?: string
  signedEmail?: string
  signedIp?: string | null
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

function buildHtml(data: ContractExportData): string {
  const auditTrailHtml = (data.status === 'SIGNED' || data.signedAt)
    ? `
    <div class="section" style="border: 1px solid #10b981; background: #ecfdf5; padding: 16px; border-radius: 12px; margin-top: 32px;">
      <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 13px;">ELECTRONIC SIGNATURE AUDIT CERTIFICATE</h3>
      <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
        <tr><td style="padding: 3px 0; color: #666; width: 120px;">Signer Name:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedName || 'Authorized Signer')}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">Signer Email:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedEmail || 'N/A')}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">Signed Date:</td><td style="font-weight: bold; color: #111;">${formatDate(data.signedAt || undefined)}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">IP Address:</td><td style="font-weight: bold; color: #111;">${escapeHtml(data.signedIp || '127.0.0.1')}</td></tr>
        <tr><td style="padding: 3px 0; color: #666;">Verification Status:</td><td style="font-weight: bold; color: #059669;">VERIFIED &amp; EXECUTED</td></tr>
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
  .body-content { font-size: 11.5px; color: #334155; line-height: 1.65; }
  .body-content h1, .body-content h2, .body-content h3 { color: #0f172a; margin-top: 1.2em; margin-bottom: 0.5em; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-label">Legal Agreement / Contract</div>
    <h1>${escapeHtml(data.title || 'Service Agreement')}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <span class="meta-label">Contract Amount</span>
        <span class="meta-value accent">${formatCurrency(data.amount, data.currency || 'USD')}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date Created</span>
        <span class="meta-value">${formatDate(data.createdAt)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-value" style="color: ${data.status === 'SIGNED' ? '#059669' : '#6366f1'};">${escapeHtml(data.status || 'DRAFT')}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="body-content">${renderMarkdown(data.body || '')}</div>
  </div>

  ${auditTrailHtml}

  <div class="footer">
    Generated on ${formatDate()} &middot; Binding Contract &middot; Winlance Platform
  </div>
</div>
</body>
</html>`
}

export function useContractExport() {
  const isExporting = ref(false)

  async function exportPdf(data: ContractExportData) {
    isExporting.value = true
    let iframe: HTMLIFrameElement | null = null
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const html = buildHtml(data)

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

      await new Promise(resolve => setTimeout(resolve, 250))

      const pageContent = (iframeDoc.querySelector('.page') || iframeDoc.body) as HTMLElement
      const filename = `${(data.title || 'contract').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`

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
