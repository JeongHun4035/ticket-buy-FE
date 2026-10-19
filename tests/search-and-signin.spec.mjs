import { expect, test } from '@playwright/test'

const signIn = async page => {
  await page.goto('/sign-in')
  await page.locator('#userId').fill('demo')
  await page.locator('#password').fill('Demo1234!')
  await page.getByRole('button', {
    name: '로그인',
    exact: true,
  }).click()
  await expect(page).toHaveURL('http://localhost:5173/')
}

for (const [
  path,
  endpoint,
  label,
] of [
    [
      '/',
      'events',
      '공연명 또는 장소 검색',
    ],
    [
      '/board',
      'posts',
      '게시글 검색',
    ],
    [
      '/support',
      'faqs',
      '질문 검색',
    ],
  ]) {
  test(`${endpoint} search only requests on submission`, async ({ page }) => {
    await signIn(page)
    const queries = []
    await page.route(`**/api/v1/${endpoint}?*`, async route => {
      queries.push(new URL(route.request().url()).searchParams.get('q'))
      await route.fulfill({
        json: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      })
    })
    await page.goto(path)
    await expect.poll(() => queries.length).toBe(1)
    const input = page.getByRole('textbox', {
      name: label,
      exact: true,
    })
    await input.fill('별빛')
    // Allow React effects to run; typing must still produce no query request.
    await page.waitForTimeout(250)
    expect(queries).toEqual([''])
    await input.dispatchEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
    })
    expect(queries).toEqual([''])
    await input.press('Enter')
    await expect.poll(() => queries).toEqual(['', '별빛'])
    await page.getByRole('button', {
      name: '검색',
      exact: true,
    }).click()
    await expect.poll(() => queries).toEqual([
      '',
      '별빛',
      '별빛',
    ])
    await input.fill('')
    await page.waitForTimeout(250)
    expect(queries).toEqual([
      '',
      '별빛',
      '별빛',
    ])
    await page.getByRole('button', {
      name: '검색',
      exact: true,
    }).click()
    await expect.poll(() => queries).toEqual([
      '',
      '별빛',
      '별빛',
      '',
    ])
  })
}

test('login starts at the top and balances desktop columns without mobile overflow', async ({ page }) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  // Navigate without Playwright first scrolling the offscreen header into view.
  await page.getByRole('link', {
    name: '고객센터',
    exact: true,
  }).evaluate(link => link.click())
  await expect(page).toHaveURL('http://localhost:5173/sign-in')
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  const columns = await page.locator('.signin-main').evaluate(main => {
    const intro = main.querySelector('.signin-intro').getBoundingClientRect()
    const panel = main.querySelector('.signin-panel').getBoundingClientRect()
    return {
      widthDifference: Math.abs(intro.width - panel.width),
      topDifference: Math.abs(intro.top - panel.top),
      heightDifference: Math.abs(intro.height - panel.height),
    }
  })
  expect(columns.widthDifference).toBeLessThan(1)
  expect(columns.topDifference).toBeLessThan(1)
  expect(columns.heightDifference).toBeLessThan(1)
  await page.setViewportSize({
    width: 390,
    height: 700,
  })
  await expect(page.locator('.signin-intro')).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
