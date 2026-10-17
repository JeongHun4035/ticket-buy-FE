import { expect, test } from '@playwright/test'

const venue = id => ({
  id,
  name: 'Venue ' + id,
  capacity: 5000,
  mapWidth: 1000,
  mapHeight: 800,
})
const layout = id => ({
  venue: venue(id),
  floors: [
    {
      id: 'f1',
      name: '1F',
      level: 1,
    },
  ],
  items: [
    {
      id: String(id * 100),
      name: 'Block ' + id,
      floor: '1F',
      floorId: 'f1',
      totalSeats: 200,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      sortOrder: 0,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 1,
})
const event = {
  id: 9001,
  title: 'Created concert',
  description: 'Description',
  category: 'CONCERT',
  venue: 'Venue 1',
  date: '2099-12-01T10:00:00Z',
  price: 150000,
  posterUrl: 'http://localhost:8080/posters/concert.svg',
  status: 'ON_SALE',
}
const pageData = items => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
})
const mock = async (page, role = 'ADMIN', onCreate = null) => {
  await page.addInitScript(() => localStorage.setItem('ticket-buy-authenticated', 'true'))
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url())
    const path = url.pathname
    let body = pageData([])
    if (path.endsWith('/auth/refresh')) body = {
      accessToken: 'mock-token',
      expiresAt: '2099-01-01T00:00:00Z',
      tokenType: 'Bearer',
      user: {
        id: 'mock-admin',
        name: 'Admin',
        role,
      },
    }
    else if (path.endsWith('/users/me')) body = {
      id: 'mock-admin',
      name: 'Admin',
      role,
    }
    else if (path === '/api/v1/admin/events' && onCreate) {
      await onCreate(route); return
    } else if (path.endsWith('/admin/venues')) body = {
      items: [venue(1), venue(2)],
      total: 40,
      page: Number(url.searchParams.get('page')),
      pageSize: 20,
    }
    else if (/admin\/venues\/\d+\/sections$/.test(path)) body = layout(Number(path.split('/').at(-2)))
    else if (path === '/api/v1/events/9001') body = event
    else if (path === '/api/v1/events' || path === '/api/v1/events/featured') body = pageData([event])
    else if (path.endsWith('/support/info')) body = {
      serviceName: 'Support',
      message: 'Support',
    }
    await route.fulfill({ json: body })
  })
}
const fill = async (page, title = 'Created concert') => {
  await page.goto('/admin/events/new')
  await page.getByRole('textbox', {
    name: '제목',
    exact: true,
  }).first()
    .fill(title)
  await page.getByRole('textbox', {
    name: '설명',
    exact: true,
  }).first()
    .fill('Description')
  await page.getByLabel('공연장', { exact: true }).selectOption('1')
  await page.getByLabel('공연 시작 시각', { exact: true }).fill('2099-12-01T19:00')
  await page.getByLabel('예매 오픈 시각', { exact: true }).fill('2020-01-01T09:00')
  await page.getByLabel('예매 마감 시각', { exact: true }).fill('2099-12-01T18:00')
  await page.getByRole('checkbox').first()
    .check()
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 150
    const context = canvas.getContext('2d'); context.fillStyle = '#5865f2'; context.fillRect(0, 0, 100, 150)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page.getByLabel('이미지 선택', { exact: true }).setInputFiles({
    name: 'poster.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  })
  await expect(page.locator('.admin-event-preview img')).toBeVisible()
}

test('admin event form sends multipart once and opens the created event with its poster', async ({ page }) => {
  let submissions = 0
  await mock(page, 'ADMIN', async route => {
    submissions++
    expect(route.request().headers()['content-type']).toMatch(/^multipart\/form-data; boundary=/)
    expect(route.request().headers().authorization).toBe('Bearer mock-token')
    const data = await new Request(route.request().url(), {
      method: 'POST',
      headers: route.request().headers(),
      body: route.request().postDataBuffer(),
    }).formData()
    expect(data.get('event').type).toBe('application/json')
    const payload = JSON.parse(await data.get('event').text())
    expect(payload.titles).toEqual({ ko: 'Created concert' })
    expect(payload.performances[0].startsAt).toBe('2099-12-01T10:00:00.000Z')
    expect(payload.performances[0].sectionPrices).toEqual([
      {
        sectionId: 100,
        grade: 'R',
        price: 100000,
      },
    ])
    expect(data.get('image').type).toBe('image/png')
    await new Promise(resolve => setTimeout(resolve, 150))
    await route.fulfill({
      status: 201,
      json: {
        event,
        performances: [{ id: 8001 }],
      },
    })
  })
  await fill(page)
  await expect(page.locator('.admin-event-summary')).toContainText('판매 좌석 200석')
  await expect(page.locator('.admin-event-summary')).toContainText('전체 수용 5000석')
  await page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  }).click()
  await expect(page.getByRole('button', {
    name: '등록 중',
    exact: true,
  })).toBeDisabled()
  await expect(page.getByRole('link', { name: '등록한 행사 상세 보기' })).toBeVisible()
  expect(submissions).toBe(1)
  await page.getByRole('link', { name: '등록한 행사 상세 보기' }).click()
  await expect(page.locator('dialog[open]')).toContainText('Created concert')
  await expect(page.locator('dialog[open] img')).toHaveAttribute('src', event.posterUrl)
})

test('venue pagination, venue changes, performance add/remove and invalid images', async ({ page }) => {
  await mock(page)
  await fill(page)
  const field = page.locator('.admin-event-performance').first()
  await field.getByRole('button', {
    name: '다음 페이지',
    exact: true,
  }).click()
  await expect(field.getByRole('button', {
    name: '2페이지',
    exact: true,
  })).toHaveAttribute('aria-current', 'page')
  await page.getByLabel('공연장', { exact: true }).selectOption('2')
  await expect(page.locator('.admin-event-summary')).toContainText('판매 좌석 0석')
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await page.getByRole('button', {
    name: '회차 추가',
    exact: true,
  }).click()
  await expect(page.locator('.admin-event-performance')).toHaveCount(2)
  await page.getByRole('button', {
    name: '회차 제거',
    exact: true,
  }).last()
    .click()
  await expect(page.locator('.admin-event-performance')).toHaveCount(1)
  await page.getByLabel('이미지 선택', { exact: true }).setInputFiles({
    name: 'bad.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  })
  await expect(page.getByRole('alert')).toContainText('PNG/JPEG')
  await expect(page.locator('.admin-event-preview img')).toBeVisible()
  await page.getByRole('button', {
    name: '이미지 제거',
    exact: true,
  }).click()
  await expect(page.locator('.admin-event-preview img')).toHaveCount(0)
})

test('server errors keep form and image, show trace ID, and honor Retry-After', async ({ page }) => {
  let count = 0
  await mock(page, 'ADMIN', async route => {
    count++
    await route.fulfill({
      status: 429,
      headers: { 'Retry-After': '2' },
      json: {
        code: 'RATE_LIMITED',
        message: 'Wait',
        traceId: 'test-trace',
      },
    })
  })
  await fill(page)
  await page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  }).click()
  await expect(page.getByRole('alert')).toContainText('test-trace')
  await expect(page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  })).toBeDisabled()
  await expect(page.locator('.admin-event-preview img')).toBeVisible()
  await expect(page.getByRole('textbox', {
    name: '제목',
    exact: true,
  }).first()).toHaveValue('Created concert')
  await expect(page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  })).toBeEnabled({ timeout: 5000 })
  expect(count).toBe(1)
})

test('network uncertainty requires manual confirmation before another submission', async ({ page }) => {
  let count = 0
  await mock(page, 'ADMIN', async route => {
    count++; await route.abort('failed')
  })
  await fill(page)
  await page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  }).click()
  await expect(page.getByRole('alert')).toContainText('중복 등록')
  await expect(page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  })).toBeDisabled()
  await expect(page.getByRole('button', { name: '미등록 확인 후 다시 제출 허용' })).toBeVisible()
  expect(count).toBe(1)
})

test('non-admin and anonymous users cannot open event creation', async ({ page }) => {
  await mock(page, 'USER')
  await page.goto('/admin/events/new')
  await expect(page).toHaveURL('http://localhost:5173/')
  await page.locator('.account-menu-trigger').click()
  await expect(page.getByRole('link', {
    name: '행사 등록',
    exact: true,
  })).toHaveCount(0)
  await page.route('**/api/v1/auth/refresh', route => route.fulfill({
    status: 401,
    json: {
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Login required',
    },
  }))
  await page.goto('/admin/events/new')
  await expect(page).toHaveURL(/sign-in/)
  await expect(page.locator('#userId')).toBeVisible()
})

test('broken poster URLs use the shared fallback in cards, slider and details', async ({ page }) => {
  await mock(page)
  await page.route('http://localhost:8080/posters/concert.svg', route => route.abort())
  await page.goto('/?eventId=9001')
  await expect(page.locator('dialog[open] img')).toHaveAttribute('src', '/images/poster-fallback.svg')
  await expect(page.locator('.event-info img').first()).toHaveAttribute('src', '/images/poster-fallback.svg')
  await expect(page.locator('.ticket-feature img').first()).toHaveAttribute('src', '/images/poster-fallback.svg')
  await expect(page.locator('dialog[open] img')).toHaveAttribute('alt', event.title)
})

test('late venue responses cannot replace the newly selected venue', async ({ page }) => {
  await mock(page)
  let release
  const gate = new Promise(resolve => {
    release = resolve
  })
  let requested = false
  await page.route('**/api/v1/admin/venues/1/sections', async route => {
    requested = true
    await gate
    await route.fulfill({ json: layout(1) }).catch(() => {})
  })
  await page.goto('/admin/events/new')
  await page.getByLabel('공연장', { exact: true }).selectOption('1')
  await expect.poll(() => requested).toBe(true)
  await page.getByLabel('공연장', { exact: true }).selectOption('2')
  await expect(page.getByRole('checkbox')).toHaveAccessibleName(/Block 2/)
  release()
  await expect(page.getByRole('checkbox')).toHaveAccessibleName(/Block 2/)
  await expect(page.getByText('Block 1', { exact: true })).toHaveCount(0)
})

for (const [status, code] of [
  [400, 'INVALID_SCHEDULE'],
  [401, 'AUTHENTICATION_REQUIRED'],
  [403, 'FORBIDDEN'],
  [500, 'INTERNAL_ERROR'],
]) {
  test('event registration handles HTTP ' + status + ' without replaying the POST', async ({ page }) => {
    let count = 0
    await mock(page, 'ADMIN', async route => {
      count++
      await route.fulfill({
        status,
        json: {
          code,
          message: 'Server message',
          traceId: 'trace-' + status,
        },
      })
    })
    await fill(page)
    await page.getByRole('button', {
      name: '행사 등록',
      exact: true,
    }).click()
    await expect(page.getByRole('alert')).toContainText('trace-' + status)
    await expect(page.locator('.admin-event-preview img')).toBeVisible()
    expect(count).toBe(1)
  })
}

test('event registration supports English, Simplified Chinese and dark theme', async ({ page }) => {
  await mock(page)
  await page.goto('/admin/events/new')
  await page.getByRole('combobox', { name: '언어 변경' }).selectOption('en')
  await expect(page.getByRole('heading', {
    name: 'Create event',
    exact: true,
  })).toBeVisible()
  await page.getByRole('combobox', { name: /language/i }).selectOption('zh-CN')
  await expect(page.getByRole('heading', {
    name: '创建活动',
    exact: true,
  })).toBeVisible()
  await page.getByRole('button', { name: /深色/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('live backend creates a poster event and serves its public image', async ({ page }) => {
  test.skip(process.env.TICKET_BUY_LIVE_EVENT_TEST !== '1', 'Opt-in: creates a persistent demo event; the backend has no delete-event API.')
  await page.goto('/sign-in')
  await page.locator('#userId').fill('admin')
  await page.locator('#password').fill('Demo1234!')
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
  const title = 'Frontend integration ' + Date.now()
  await fill(page, title)
  const createdResponse = page.waitForResponse(response => response.url().endsWith('/api/v1/admin/events') && response.request().method() === 'POST')
  await page.getByRole('button', {
    name: '행사 등록',
    exact: true,
  }).click()
  const response = await createdResponse
  expect(response.status()).toBe(201)
  const created = await response.json()
  expect(created.event.id).toBeGreaterThan(0)
  expect(created.performances).toHaveLength(1)
  await page.getByRole('link', { name: '등록한 행사 상세 보기' }).click()
  await expect(page.locator('dialog[open]')).toContainText(title)
  const poster = page.locator('dialog[open] img')
  await expect(poster).toHaveAttribute('src', created.event.posterUrl)
  await expect(poster).toHaveAttribute('data-loaded', 'true')
  console.log('Created demo event ID: ' + created.event.id + ', performance IDs: ' + created.performances.map(item => item.id).join(', '))
})
