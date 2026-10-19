import { expect, test } from '@playwright/test'

for (const status of [400, 401, 403, 404, 408, 409, 422, 429, 500, 502, 503, 504]) {
  test(`error page ${status}`, async ({ page }) => {
    await page.goto(`/error/${status}`)
    await expect(page.getByText(`ERROR ${status}`, { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/')
  })
}

test('unknown URL displays 404 and a home link', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  await expect(page).toHaveURL(/\/error\/404$/)
  await expect(page.getByText('ERROR 404', { exact: true })).toBeVisible()
})

test('429 waits for Retry-After then retries the failed query', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/events') && attempts++ === 0) {
      await route.fulfill({ status: 429, headers: { 'Retry-After': '2' }, json: { message: 'Too many requests' } })
      return
    }
    await route.fulfill({ json: { items: [], total: 0, page: 1, pageSize: 10 } })
  })
  await page.goto('/?q=concert')
  await expect(page.getByText('ERROR 429', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/error\/429$/)
  await expect(page.locator('.ticket-main')).toHaveCount(0)
  const retry = page.getByRole('button', { name: '다시 시도', exact: true })
  await expect(retry).toBeDisabled()
  await expect(retry).toBeEnabled({ timeout: 5000 })
  await retry.click()
  await expect(page).toHaveURL(/\/\?q=concert$/)
  await expect(page.getByText('ERROR 429', { exact: true })).toHaveCount(0)
  expect(attempts).toBe(2)
})

for (const status of [400, 403, 404, 500, 503]) {
  test(`API ${status} navigates to shared error route`, async ({ page }) => {
    await page.route('**/api/v1/**', route => route.fulfill({ status, json: { message: 'Failure' } }))
    await page.goto('/board?q=notice')
    await expect(page).toHaveURL(`/error/${status}`)
    await expect(page.getByText(`ERROR ${status}`, { exact: true })).toBeVisible()
    await expect(page.locator('.service-page')).toHaveCount(0)
    await page.reload()
    await expect(page.getByText(`ERROR ${status}`, { exact: true })).toBeVisible()
  })
}

test('network failures navigate to connection error route', async ({ page }) => {
  await page.route('**/api/v1/**', route => route.abort('failed'))
  await page.goto('/board')
  await expect(page).toHaveURL('/error/0')
  await expect(page.getByRole('heading', { name: '연결 상태를 확인해주세요' })).toBeVisible()
})
