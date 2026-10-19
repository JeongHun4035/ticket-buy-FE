import fs from 'node:fs'

import { expect, test } from '@playwright/test'

const observedOperations = new Set()
test.beforeEach(({ page }) => {
  page.on('response', response => {
    if (!response.ok()) return
    const url = new URL(response.url())
    if (!url.pathname.startsWith('/api/v1/')) return
    const path = url.pathname
      .replace(/\/events\/\d+/, '/events/{eventId}')
      .replace(/\/performances\/\d+/, '/performances/{performanceId}')
      .replace(/\/admin\/(posts|faqs)\/\d+/, '/admin/$1/{id}')
      .replace(/\/posts\/\d+/, '/posts/{postId}')
      .replace(/\/holds\/[^/]+/, '/holds/{holdId}')
      .replace(/\/reservations\/(?!me(?:$|\/))[^/]+/, '/reservations/{reservationId}')
    observedOperations.add(response.request().method() + ' ' + path)
  })
})

const signIn = async (page, username = 'demo') => {
  await page.goto('/sign-in')
  await page.locator('#userId').fill(username)
  await page.locator('#password').fill('Demo1234!')
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.locator('.ticket-header-user')).toContainText(username === 'admin' ? 'admin' : '예매 사용자')
}

test('public lists, search, language switching, support and board use backend data', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const initialList = page.waitForResponse(response => new URL(response.url()).pathname === '/api/v1/events' && response.ok())
  await page.goto('/')
  const initialData = await (await initialList).json()
  await expect(page.locator('.ticket-event-grid tbody tr')).toHaveCount(initialData.items.length)
  await page.locator('.event-info').first()
    .click()
  await expect(page.locator('dialog[open]')).toContainText(initialData.items[0].title)
  await page.getByRole('button', {
    name: '행사 상세 닫기',
    exact: true,
  }).click()
  await page.getByRole('button', {
    name: '콘서트',
    exact: true,
  }).click()
  await expect(page.locator('.ticket-event-grid tbody')).toContainText('서울 라이브 콘서트')
  await page.getByRole('button', {
    name: '전체',
    exact: true,
  }).click()
  await page.getByRole('textbox', {
    name: '공연명 또는 장소 검색',
    exact: true,
  }).fill('별빛')
  await page.getByRole('textbox', {
    name: '공연명 또는 장소 검색',
    exact: true,
  }).press('Enter')
  await expect(page.locator('.ticket-event-grid tbody')).toContainText('별빛 뮤지컬')
  await page.getByRole('textbox', {
    name: '공연명 또는 장소 검색',
    exact: true,
  }).fill('')
  await page.getByRole('button', {
    name: '검색',
    exact: true,
  }).click()
  await page.getByLabel('언어 변경').selectOption('en')
  await expect(page.locator('.ticket-event-grid tbody')).not.toContainText('서울 라이브 콘서트')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByLabel('Change language').selectOption('ko')
  await page.getByRole('link', {
    name: '고객센터',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await page.locator('#userId').fill('demo')
  await page.locator('#password').fill('Demo1234!')
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/support')
  await page.locator('.service-faqs summary').first()
    .click()
  await expect(page.locator('.service-faqs details[open]')).toContainText('최대 4석')
  await page.getByRole('link', {
    name: '게시판',
    exact: true,
  }).click()
  await page.locator('.service-post-title').first()
    .click()
  await expect(page.locator('dialog[open]')).toContainText('실제 결제')
  expect(errors).toEqual([])
})

test('login, session restoration, queue, hold, release, confirmation and cancellation', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await signIn(page)
  await page.reload()
  await expect(page.locator('.ticket-header-user')).toContainText('예매 사용자')
  await page.getByRole('button', {
    name: '예매하기',
    exact: true,
  }).first()
    .click()
  await page.getByLabel('공연 일시').selectOption({ index: 1 })
  const queueResponse = page.waitForResponse(response => response.request().method() === 'POST' && /\/performances\/\d+\/queue$/.test(new URL(response.url()).pathname) && response.ok())
  await page.getByRole('button', {
    name: '대기열 입장',
    exact: true,
  }).click()
  await expect(page.locator('.seat-map__seat').first()).toBeVisible({ timeout: 40000 })
  // Verify the real status endpoint even when admission required no UI polling.
  const joined = await queueResponse
  const currentQueue = await page.evaluate(async ({ url, authorization }) => {
    const response = await fetch(url + '/me', {
      credentials: 'include',
      headers: { Authorization: authorization },
    })
    if (!response.ok) throw new Error('Queue status failed: ' + response.status)
    return response.json()
  }, {
    url: joined.url(),
    authorization: joined.request().headers().authorization,
  })
  expect(currentQueue.state).toBe('ADMITTED')
  await page.locator('.seat-map__seat:not([disabled])').first()
    .click()
  await page.getByRole('button', {
    name: '좌석 확보',
    exact: true,
  }).click()
  await expect(page.getByRole('button', {
    name: '예매 확정',
    exact: true,
  })).toBeVisible()
  await page.getByRole('button', {
    name: '좌석 다시 선택',
    exact: true,
  }).click()
  await expect(page.getByRole('button', {
    name: '좌석 확보',
    exact: true,
  })).toBeVisible()
  await expect(page.locator('.seat-map__seat:not([disabled])').first()).toBeEnabled()
  await page.locator('.seat-map__seat:not([disabled])').first()
    .click()
  await page.getByRole('button', {
    name: '좌석 확보',
    exact: true,
  }).click()
  await page.getByRole('button', {
    name: '예매 확정',
    exact: true,
  }).click()
  await expect(page.locator('.reservation-success')).toContainText('예매가 확정되었습니다.')
  await page.getByRole('button', {
    name: '닫기',
    exact: true,
  }).click()
  await page.locator('.account-menu-trigger').click()
  await page.locator('.ticket-header-account').getByRole('link', {
    name: '내 예매',
    exact: true,
  })
    .click()
  await page.getByRole('button', {
    name: '상세 보기',
    exact: true,
  }).first()
    .click()
  await page.getByRole('button', {
    name: '예매 취소',
    exact: true,
  }).click()
  await expect(page.locator('dialog[open]')).toContainText('취소 완료')
  await page.getByRole('button', {
    name: '닫기',
    exact: true,
  }).click()
  await page.locator('.account-menu-trigger').click()
  await page.getByRole('button', {
    name: '로그아웃',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  let loggedOutRefreshes = 0
  page.on('request', request => {
    if (request.url().endsWith('/auth/refresh')) loggedOutRefreshes++
  })
  await page.reload()
  await expect(page.locator('#userId')).toBeVisible()
  expect(loggedOutRefreshes).toBe(0)
  expect(errors).toEqual([])
})

test('administrators can create, edit and delete posts and FAQs through the UI', async ({ page }) => {
  await signIn(page, 'admin')
  await page.locator('.account-menu-trigger').click()
  await page.getByRole('link', {
    name: '콘텐츠 관리',
    exact: true,
  }).click()
  for (const kind of ['posts', 'faqs']) {
    await page.getByRole('combobox', {
      name: '분류',
      exact: true,
    }).selectOption(kind)
    await page.getByRole('button', {
      name: '새 글 작성',
      exact: true,
    }).click()
    const dialog = page.locator('dialog[open]')
    const title = `Integration ${kind} ${Date.now()}`
    for (const fieldset of await dialog.locator('fieldset').all()) {
      await fieldset.getByLabel('제목', { exact: true }).fill(title)
      await fieldset.getByLabel('내용', { exact: true }).fill('API integration test content')
    }
    await dialog.getByRole('button', {
      name: '저장',
      exact: true,
    }).click()
    const card = page.locator('.reservation-card').filter({ hasText: title })
    await expect(card).toBeVisible()
    await card.getByRole('button', {
      name: '수정',
      exact: true,
    }).click()
    await expect(dialog.locator('fieldset').first()
      .getByLabel('제목', { exact: true })).toHaveValue(title)
    await dialog.locator('fieldset').first()
      .getByLabel('제목', { exact: true })
      .fill(`${title} edited`)
    await dialog.getByRole('button', {
      name: '저장',
      exact: true,
    }).click()
    await expect(card).toContainText('edited')
    page.once('dialog', dialog => {
      void dialog.accept()
    })
    await card.getByRole('button', {
      name: '삭제',
      exact: true,
    }).click()
    await expect(card).toHaveCount(0)
  }
})

test('protected requests refresh expired access tokens and recover without logging out', async ({ page }) => {
  await signIn(page)
  const loaded = page.waitForResponse(response => response.url().includes('/reservations/me?') && response.ok())
  await page.locator('.account-menu-trigger').click()
  await page.locator('.ticket-header-account').getByRole('link', {
    name: '내 예매',
    exact: true,
  })
    .click()
  await loaded
  let attempts = 0
  let refreshes = 0
  page.on('request', request => {
    if (request.url().endsWith('/auth/refresh')) refreshes++
  })
  await page.route('**/api/v1/reservations/me?*', async route => {
    attempts++
    if (attempts === 1) await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'TOKEN_EXPIRED',
        message: 'Expired',
      }),
    })
    else await route.continue()
  })
  await page.getByLabel('페이지당', { exact: true }).selectOption('20')
  await expect.poll(() => refreshes).toBe(1)
  await expect.poll(() => attempts).toBeGreaterThanOrEqual(2)
  await expect(page.locator('.ticket-header-user')).toContainText('예매 사용자')
  await expect(page.locator('.api-error')).toHaveCount(0)
})

test('seat conflicts are displayed and the seat map can be retried', async ({ page }) => {
  await signIn(page)
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
  await expect(page.locator('.seat-map__seat').first()).toBeVisible()
  await page.route('**/api/v1/performances/*/holds', route => route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({
      code: 'SEAT_CONFLICT',
      message: 'Already held',
    }),
  }), { times: 1 })
  await page.locator('.seat-map__seat:not([disabled])').first()
    .click()
  await page.getByRole('button', {
    name: '좌석 확보',
    exact: true,
  }).click()
  await expect(page.locator('dialog[open] .api-error')).toContainText('SEAT_CONFLICT')
  await expect(page.locator('.seat-map__seat.is-selected')).toHaveCount(0)
  await page.locator('.seat-map__seat:not([disabled])').first()
    .click()
  await page.getByRole('button', {
    name: '좌석 확보',
    exact: true,
  }).click()
  await expect(page.getByRole('button', {
    name: '예매 확정',
    exact: true,
  })).toBeVisible()
  await page.getByRole('button', {
    name: '닫기',
    exact: true,
  }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

test('anonymous visits never refresh and support and booking redirect to login', async ({ page }) => {
  let refreshes = 0
  page.on('request', request => {
    if (request.url().endsWith('/auth/refresh')) refreshes++
  })
  const initialList = page.waitForResponse(response => new URL(response.url()).pathname === '/api/v1/events' && response.ok())
  await page.goto('/')
  const initialData = await (await initialList).json()
  await expect(page.locator('.ticket-event-grid tbody tr')).toHaveCount(initialData.items.length)
  await page.getByRole('link', {
    name: '고객센터',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await expect(page.locator('.common-toast')).toHaveCount(1)
  await expect(page.locator('.common-toast')).toContainText('로그인이 필요합니다.')
  await page.reload()
  await page.locator('#userId').fill('demo')
  await page.locator('#password').fill('incorrect-password')
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page.locator('.signin-message')).toBeVisible()
  expect(refreshes).toBe(0)
  await page.goto('/')
  await page.getByRole('button', {
    name: '예매하기',
    exact: true,
  }).first()
    .click()
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await expect(page.locator('.common-toast')).toHaveCount(1)
  await expect(page.locator('.common-toast')).toContainText('로그인이 필요합니다.')
  expect(refreshes).toBe(0)
  await page.goto('/support')
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await expect(page.locator('.common-toast')).toHaveCount(1)
  await expect(page.locator('.common-toast')).toContainText('로그인이 필요합니다.')
  expect(refreshes).toBe(0)
})

test('StrictMode initial queries are sent once without cancelled requests', async ({ page }) => {
  const counts = new Map()
  const failures = []
  page.on('request', request => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/v1/')) counts.set(path, (counts.get(path) ?? 0) + 1)
  })
  page.on('requestfailed', request => {
    if (request.url().includes('/api/v1/')) failures.push(request.url())
  })
  const initialList = page.waitForResponse(response => new URL(response.url()).pathname === '/api/v1/events' && response.ok())
  await page.goto('/')
  const initialData = await (await initialList).json()
  await expect(page.locator('.ticket-event-grid tbody tr')).toHaveCount(initialData.items.length)
  await expect(page.locator('.ticket-footer-email')).not.toBeEmpty()
  for (const path of [
    '/api/v1/events',
    '/api/v1/events/featured',
    '/api/v1/categories',
    '/api/v1/support/info',
  ]) {
    expect(counts.get(path), path).toBe(1)
  }
  expect(failures).toEqual([])
})

test('signup validates inputs, creates an account, reports duplicate IDs and allows login', async ({ page }) => {
  const username = 'signup_test_' + Date.now()
  const password = 'Signup1234!'
  let signupRequests = 0
  let refreshRequests = 0
  page.on('request', request => {
    if (request.url().endsWith('/auth/signup')) signupRequests++
    if (request.url().endsWith('/auth/refresh')) refreshRequests++
  })
  await page.goto('/sign-in')
  await page.getByRole('link', {
    name: '회원가입',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/sign-up')
  await page.locator('#signup-username').fill(username)
  await page.locator('#signup-name').fill('  회원가입 테스트  ')
  await page.locator('#signup-password').fill(password)
  await page.locator('#signup-password-confirm').fill('different1234')
  await page.getByRole('button', {
    name: '회원가입',
    exact: true,
  }).click()
  await expect(page.getByRole('alert')).toContainText('비밀번호가 일치하지 않습니다.')
  expect(signupRequests).toBe(0)
  await page.locator('#signup-password-confirm').fill(password)
  await page.getByRole('button', {
    name: '회원가입',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await expect(page.locator('#userId')).toHaveValue(username)
  await expect(page.locator('#password')).toHaveValue('')
  await expect(page.locator('.common-toast')).toContainText('회원가입이 완료되었습니다.')
  expect(refreshRequests).toBe(0)
  await page.getByRole('link', {
    name: '회원가입',
    exact: true,
  }).click()
  await page.locator('#signup-username').fill(username)
  await page.locator('#signup-name').fill('회원가입 테스트')
  await page.locator('#signup-password').fill(password)
  await page.locator('#signup-password-confirm').fill(password)
  await page.getByRole('button', {
    name: '회원가입',
    exact: true,
  }).click()
  await expect(page.getByRole('alert')).toContainText('이미 사용 중인 아이디')
  expect(refreshRequests).toBe(0)
  await page.getByRole('link', {
    name: '로그인',
    exact: true,
  }).click()
  await page.locator('#userId').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.locator('.ticket-header-user')).toContainText('회원가입 테스트')
})

test('empty reservations keep grid columns, empty message and pagination visible', async ({ page }) => {
  await signIn(page)
  await page.route('**/api/v1/reservations/me?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    }),
  }))
  await page.locator('.account-menu-trigger').click()
  await page.locator('.ticket-header-account').getByRole('link', {
    name: '내 예매',
    exact: true,
  })
    .click()
  const grid = page.locator('.reservations-grid')
  await expect(grid.locator('thead th')).toHaveCount(6)
  await expect(grid.locator('tbody .common-grid__empty')).toHaveAttribute('colspan', '6')
  await expect(grid.locator('tbody')).toContainText('예매 내역이 없습니다.')
  await expect(grid.locator('tbody')).toContainText('관심 있는 공연을 찾아')
  await expect(grid.locator('.common-pagination')).toBeVisible()
  await expect(grid.getByRole('button', {
    name: '다음 페이지',
    exact: true,
  })).toBeDisabled()
})

test('account popover toggles, closes with Escape and outside clicks, and fits mobile', async ({ page }) => {
  await signIn(page)
  const trigger = page.locator('.account-menu-trigger')
  const menu = page.getByRole('navigation', { name: '사용자 메뉴' })
  await expect(menu).toHaveCount(0)
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('link', {
    name: '내 예매',
    exact: true,
  })).toBeVisible()
  await expect(menu.getByRole('button', {
    name: '로그아웃',
    exact: true,
  })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.locator('.ticket-hero h1').click()
  await expect(menu).toHaveCount(0)
  await page.setViewportSize({
    width: 375,
    height: 812,
  })
  await trigger.click()
  await expect(menu).toBeVisible()
  const bounds = await menu.boundingBox()
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(375)
})

test('non-admin users cannot see or open content management', async ({ page }) => {
  await signIn(page)
  await page.locator('.account-menu-trigger').click()
  await expect(page.locator('.account-role')).toHaveText('일반 회원')
  await expect(page.getByRole('link', {
    name: '콘텐츠 관리',
    exact: true,
  })).toHaveCount(0)
  let adminCalls = 0
  page.on('request', request => {
    if (request.url().includes('/api/v1/admin/')) adminCalls++
  })
  await page.goto('/admin')
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.locator('.common-toast')).toContainText('접근 권한이 없습니다.')
  expect(adminCalls).toBe(0)
})

test('demo payment methods can be added, made default, restored and deleted', async ({ page }) => {
  await signIn(page)
  await page.locator('.account-menu-trigger').click()
  await page.getByRole('link', {
    name: '결제 정보',
    exact: true,
  }).click()
  await expect(page.locator('.payment-grid tbody')).toContainText('등록된 결제 정보가 없습니다.')
  for (const [last4, nickname] of [['1234', '공연용 카드'], ['5678', '예비 카드']]) {
    await page.getByRole('button', {
      name: '결제 정보 추가',
      exact: true,
    }).first()
      .click()
    const dialog = page.locator('dialog[open]')
    await dialog.getByLabel('카드 끝 4자리', { exact: true }).fill(last4)
    await dialog.getByLabel('별칭', { exact: true }).fill(nickname)
    await dialog.getByRole('button', {
      name: '추가',
      exact: true,
    }).click()
    await expect(page.locator('.payment-grid tbody')).toContainText(nickname)
  }
  const backup = page.locator('.payment-grid tbody tr').filter({ hasText: '예비 카드' })
  await backup.getByRole('button', {
    name: '기본으로 지정',
    exact: true,
  }).click()
  await expect(backup.locator('.payment-default')).toBeVisible()
  await page.reload()
  await expect(page.locator('.payment-grid tbody')).toContainText('예비 카드')
  await expect(page.locator('.payment-grid tbody tr')).toHaveCount(2)
  for (const nickname of ['예비 카드', '공연용 카드']) {
    page.once('dialog', dialog => {
      void dialog.accept()
    })
    await page.locator('.payment-grid tbody tr').filter({ hasText: nickname })
      .getByRole('button', { name: nickname + ' 삭제' })
      .click()
  }
  await expect(page.locator('.payment-grid tbody')).toContainText('등록된 결제 정보가 없습니다.')
})

test('all Swagger endpoints were exercised successfully', () => {
  const endpoints = JSON.parse(fs.readFileSync(new URL('./api-endpoints.json', import.meta.url), 'utf8'))
  for (const endpoint of endpoints) expect(observedOperations.has(endpoint), endpoint).toBe(true)
})


test('large venue preview renders bounded seats and preserves selections across sections', async ({ page }) => {
  await page.goto('/examples/seats')
  await page.getByRole('combobox').filter({ has: page.locator('option[value="30000"]') })
    .selectOption('30000')
  await expect(page.locator('.seat-map__capacity')).toContainText('30,000')
  await expect(page.locator('.seat-map__seat')).toHaveCount(200)
  await expect(page.locator('.seat-map__sections button')).toHaveCount(150)
  await page.locator('.seat-map__seat:not(:disabled)').first()
    .click()
  await page.locator('.seat-map__sections button').nth(149)
    .click()
  await expect(page.locator('.seat-map__seat')).toHaveCount(200)
  await page.locator('.seat-map__seat:not(:disabled)').first()
    .click()
  await expect(page.locator('.seat-map__capacity')).toContainText('선택 2석')
  await page.locator('.seat-map__sections button').first()
    .click()
  await expect(page.locator('.seat-map__seat[aria-pressed="true"]')).toHaveCount(1)
  await page.getByRole('combobox').filter({ has: page.locator('option[value="500"]') })
    .selectOption('500')
  await expect(page.locator('.seat-map__sections button')).toHaveCount(3)
  await expect(page.locator('.seat-map__capacity')).toContainText('선택 0석')
  await page.locator('.seat-map__sections button').last()
    .click()
  await expect(page.locator('.seat-map__seat')).toHaveCount(100)
})
