import type { Page, Route } from '@playwright/test'

export type LeadRecord = {
  id: number
  title: string
  description: string
  status: string
  probability: number
  score: number
  estimated_value: string
  company: number | null
  contacts: unknown[]
  notes: unknown[]
  follow_ups: unknown[]
  created_at: string
  updated_at: string
}

const demoUser = {
  id: 1,
  username: 'demo',
  email: 'demo@winlance.local',
  first_name: 'Demo',
  last_name: 'User',
  is_email_verified: true,
  is_demo: true,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
}

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders,
    body: JSON.stringify(body),
  })
}

function nowIso() {
  return new Date().toISOString()
}

function makeLead(id: number, title: string): LeadRecord {
  const stamp = nowIso()
  return {
    id,
    title,
    description: '',
    status: 'NEW',
    probability: 10,
    score: 42,
    estimated_value: '0.00',
    company: null,
    contacts: [],
    notes: [],
    follow_ups: [],
    created_at: stamp,
    updated_at: stamp,
  }
}

function apiPath(url: string) {
  const { pathname } = new URL(url)
  const idx = pathname.indexOf('/api/v1')
  return idx >= 0 ? pathname.slice(idx + '/api/v1'.length) : pathname
}

/**
 * Mock `/api/v1/*` so E2E can run against a static preview without a live backend.
 * Auth tokens stay in Pinia memory — avoid full reloads after login.
 */
export async function installApiMocks(page: Page) {
  const leads = new Map<number, LeadRecord>()
  let nextLeadId = 100

  const portal = {
    project: {
      title: 'Acme rebuild',
      summary: 'Client-facing engagement dashboard',
      status: 'ACTIVE',
      progress_percent: 40,
    },
    requirements: [
      {
        id: 'req-1',
        title: 'Homepage redesign',
        description: 'Modernize landing page',
        order: 1,
      },
    ],
    offer: {
      title: 'Proposal',
      body: 'We propose a 4-week engagement.',
      status: 'SENT',
    },
    contract: {
      title: 'Contract',
      body: 'Standard freelance MSA.',
      status: 'SENT',
    },
    progress: {
      percent: 40,
      milestones: [
        {
          id: 'ms-1',
          title: 'Discovery',
          description: '',
          status: 'DONE',
          due_date: null,
          progress_percent: 100,
          order: 1,
        },
      ],
    },
    reports: [
      {
        id: 'rep-1',
        title: 'Week 1',
        body: 'Kickoff complete.',
      },
    ],
    files: [] as { id: string; name: string; url: string; notes: string }[],
  }

  await page.route(/\/api\/v1\//, async (route) => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders })
    }

    const path = apiPath(request.url())

    if (method === 'POST' && path === '/auth/login/') {
      return json(route, 200, {
        access: 'e2e-access-token',
        refresh: 'e2e-refresh-token',
      })
    }

    if (method === 'GET' && path === '/auth/me/') {
      return json(route, 200, demoUser)
    }

    if (method === 'POST' && path === '/auth/logout/') {
      return json(route, 200, { detail: 'ok' })
    }

    if (method === 'GET' && path === '/leads/') {
      const results = [...leads.values()]
      return json(route, 200, {
        count: results.length,
        next: null,
        previous: null,
        results,
      })
    }

    if (method === 'POST' && path === '/leads/') {
      const body = (request.postDataJSON() ?? {}) as { title?: string }
      const lead = makeLead(nextLeadId++, body.title || 'Untitled')
      leads.set(lead.id, lead)
      return json(route, 201, lead)
    }

    const leadMatch = path.match(/^\/leads\/(\d+)\/?$/)
    if (leadMatch) {
      const id = Number(leadMatch[1])
      const lead = leads.get(id)
      if (method === 'GET') {
        if (!lead) return json(route, 404, { detail: 'Not found.' })
        return json(route, 200, lead)
      }
      if (method === 'DELETE') {
        leads.delete(id)
        return route.fulfill({ status: 204, headers: corsHeaders, body: '' })
      }
    }

    const portalMatch = path.match(/^\/portal\/([^/]+)\/?$/)
    if (method === 'GET' && portalMatch) {
      const token = portalMatch[1]
      if (token === 'expired-token') {
        return json(route, 404, {
          error: { message: 'Invalid or expired share link.', status_code: 404, code: 'http_404' },
        })
      }
      return json(route, 200, portal)
    }

    if (method === 'POST' && /^\/portal\/[^/]+\/requirements\/?$/.test(path)) {
      const body = (request.postDataJSON() ?? {}) as { title?: string; description?: string }
      const item = {
        id: `req-${Date.now()}`,
        title: body.title || 'Requirement',
        description: body.description || '',
        order: portal.requirements.length + 1,
      }
      portal.requirements.push(item)
      return json(route, 201, item)
    }

    if (method === 'POST' && /^\/portal\/[^/]+\/accept-(offer|contract)\/?$/.test(path)) {
      return json(route, 200, { detail: 'ok' })
    }

    if (method === 'GET') {
      return json(route, 200, { count: 0, next: null, previous: null, results: [] })
    }

    return json(route, 200, {})
  })
}

export async function loginAsDemo(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@winlance.local')
  await page.getByLabel('Password').fill('demo-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(/\/app\/?$/)
}
