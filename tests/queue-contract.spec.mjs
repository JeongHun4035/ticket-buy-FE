import { expect, test } from '@playwright/test'

// Contract fixtures are isolated from the real-backend booking integration test.
const admitted = {
  state: 'ADMITTED',
  ticketNumber: 98765,
  position: 0,
  aheadCount: 0,
  estimatedWaitSeconds: null,
  admissionToken: 'contract-admission-token',
  admissionExpiresAt: new Date(Date.now() + 3600000).toISOString(),
  pollAfterSeconds: 1,
}

for (const waiting of [false, true]) {
  test(`queue contract: ${waiting ? 'position and polling admission' : 'immediate admission'} with server seat counts`, async ({ page }) => {
    await page.goto('/sign-in')
    await page.locator('#userId').fill('demo')
    await page.locator('#password').fill('Demo1234!')
    await page.getByRole('button', {
      name: '로그인',
      exact: true,
    }).click()
    await expect(page).toHaveURL('http://localhost:5173/')

    let joinedAt = 0
    let polledAt = 0
    await page.route('**/api/v1/performances/*/queue', async route => {
      joinedAt = Date.now()
      await route.fulfill({
        json: waiting ? {
          ...admitted,
          state: 'WAITING',
          position: 1234,
          aheadCount: 1233,
          admissionToken: null,
          pollAfterSeconds: 2,
        } : admitted,
      })
    })
    await page.route('**/api/v1/performances/*/queue/me', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 }); return
      }
      polledAt = Date.now()
      await route.fulfill({ json: admitted })
    })
    await page.route('**/api/v1/performances/*/seats', async route => {
      expect(route.request().headers()['x-admission-token']).toBe(admitted.admissionToken)
      expect(route.request().headers().authorization).toMatch(/^Bearer /)
      await route.fulfill({
        json: {
          items: [],
          total: 30000,
          page: 1,
          pageSize: 30000,
          availableSeats: 12345,
        },
      })
    })

    await page.getByRole('button', {
      name: '예매하기',
      exact: true,
    }).first()
      .click()
    await page.getByLabel('공연 일시').selectOption({ index: 1 })
    await page.getByRole('button', {
      name: '대기열 입장',
      exact: true,
    }).click()
    if (waiting) {
      await expect(page.locator('.waiting-room__position')).toContainText('1,234')
      await expect(page.locator('.waiting-room__position')).not.toContainText('98,765')
    }
    await expect(page.locator('.seat-map__capacity')).toContainText('전체 30,000석')
    await expect(page.locator('.seat-map__capacity')).toContainText('잔여 12,345 / 30,000석')
    if (waiting) expect(polledAt - joinedAt).toBeGreaterThanOrEqual(1900)
    else expect(polledAt).toBe(0)
    await page.getByRole('button', {
      name: '닫기',
      exact: true,
    }).click()
  })
}
