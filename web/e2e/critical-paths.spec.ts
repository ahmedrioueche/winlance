import { expect, test } from '@playwright/test'

import { installApiMocks, loginAsDemo } from './fixtures/apiMocks'

test.beforeEach(async ({ page }) => {
  await installApiMocks(page)
})

test('login redirects to dashboard', async ({ page }) => {
  await loginAsDemo(page)
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
})

test('lead create and delete', async ({ page }) => {
  await loginAsDemo(page)

  // Soft navigate — auth lives in Pinia memory and is lost on full reload.
  await page.getByLabel('Primary').getByRole('link', { name: 'Leads' }).click()
  await expect(page).toHaveURL(/\/app\/leads/)
  await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible()
  await expect(page.getByText('No leads yet')).toBeVisible()

  await page.getByRole('button', { name: 'New lead' }).first().click()
  await page.getByLabel('Title').fill('E2E pipeline lead')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/app\/leads\/\d+/)
  await expect(page.getByRole('heading', { name: 'E2E pipeline lead' })).toBeVisible()

  await page.getByRole('button', { name: /Back to leads/i }).click()
  await expect(page.getByRole('link', { name: 'E2E pipeline lead' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete lead' }).click()
  await expect(page.getByText('No leads yet')).toBeVisible()
})

test('portal happy path and expired link', async ({ page }) => {
  page.on('request', (req) => {
    if (req.url().includes('/api/v1/')) {
      // eslint-disable-next-line no-console
      console.log('API REQ', req.method(), req.url())
    }
  })
  page.on('response', async (res) => {
    if (res.url().includes('/api/v1/portal/')) {
      const body = await res.text().catch(() => '<unreadable>')
      // eslint-disable-next-line no-console
      console.log('API RES', res.status(), res.url(), body.slice(0, 200))
    }
  })

  await page.goto('/portal/valid-share-token')
  await expect(page.getByRole('heading', { name: 'Acme rebuild' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('Homepage redesign')).toBeVisible()
  await expect(page.getByText('We propose a 4-week engagement.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept offer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept contract' })).toBeVisible()
  await expect(page.getByText('40% complete')).toBeVisible()

  await page.getByLabel('Requirement title').fill('Mobile polish')
  await page.getByLabel('Description').fill('Tighten portal spacing on small screens')
  await page.getByRole('button', { name: 'Add requirement' }).click()
  await expect(page.getByText('Mobile polish')).toBeVisible()

  await page.getByRole('button', { name: 'Accept offer' }).click()
  await expect(page.getByText('Accepted')).toBeVisible()

  await page.goto('/portal/expired-token')
  await expect(page.getByText('Link unavailable')).toBeVisible()
  await expect(
    page.getByText('This share link is invalid or has expired. Ask the freelancer for a new link.'),
  ).toBeVisible()
})
