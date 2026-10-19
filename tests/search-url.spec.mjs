import { expect, test } from '@playwright/test'

const mock = async page => {
  await page.route('**/api/v1/**', route => route.fulfill({ json: { items: [], total: 0, page: 1, pageSize: 10 } }))
}

test('main search submits encoded query, preserves other parameters, and restores history', async ({ page }) => {
  await mock(page)
  await page.goto('/?q=original&category=CONCERT&sort=DATE_ASC&page=3&pageSize=12&ref=shared')
  const input = page.getByRole('textbox', { name: '공연명 또는 장소 검색' })
  await expect(input).toHaveValue('original')
  await input.fill('공연 & 전시')
  expect(new URL(page.url()).searchParams.get('q')).toBe('original')
  const request = page.waitForRequest(req => {
    const url = new URL(req.url())
    return url.pathname.endsWith('/events') && url.searchParams.get('q') === '공연 & 전시'
  })
  await input.press('Enter')
  const apiURL = new URL((await request).url())
  expect(apiURL.searchParams.get('page')).toBe('1')
  expect(apiURL.searchParams.get('category')).toBe('CONCERT')
  const url = new URL(page.url())
  expect(url.searchParams.get('q')).toBe('공연 & 전시')
  expect(url.searchParams.get('ref')).toBe('shared')
  expect(url.searchParams.get('page')).toBeNull()
  await page.reload()
  await expect(input).toHaveValue('공연 & 전시')
  await page.goBack()
  await expect(input).toHaveValue('original')
  await page.goForward()
  await expect(input).toHaveValue('공연 & 전시')
})

test('board search restores query and clears empty searches', async ({ page }) => {
  await mock(page)
  await page.goto('/board?q=notice&page=2')
  const input = page.getByRole('textbox', { name: '게시글 검색' })
  await expect(input).toHaveValue('notice')
  await input.fill('   ')
  await input.press('Enter')
  await expect(page).toHaveURL(/\/board$/)
  await expect(input).toHaveValue('')
  await page.goBack()
  await expect(input).toHaveValue('notice')
})

test('invalid pagination uses safe defaults', async ({ page }) => {
  await mock(page)
  const request = page.waitForRequest(req => new URL(req.url()).pathname.endsWith('/events'))
  await page.goto('/?page=-1&pageSize=invalid&sort=invalid')
  const url = new URL((await request).url())
  expect(url.searchParams.get('page')).toBe('1')
  expect(url.searchParams.get('pageSize')).toBe('6')
  expect(url.searchParams.get('sort')).toBe('RECOMMENDED')
})
