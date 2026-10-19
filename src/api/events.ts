import i18n from '@/i18n'

import { request } from './client'

import type { ApiPage } from '@/types/interfaces/api/common'
import type { ApiEvent, Category, EventQuery, Performance } from '@/types/interfaces/api/events'

const lang = () => i18n.resolvedLanguage ?? 'ko'

export const getEvents = (query: EventQuery, signal?: AbortSignal, language = lang()) => request<ApiPage<ApiEvent>>('/events', {
  params: {
    ...query,
    category: query.category || undefined,
    lang: language,
  },
  ...(signal ? { signal } : {}),
})

export const getFeaturedEvents = (signal?: AbortSignal, language = lang()) => request<ApiPage<ApiEvent>>('/events/featured', {
  params: {
    pageSize: 20,
    lang: language,
  },
  ...(signal ? { signal } : {}),
})

export const getEvent = (id: number) => request<ApiEvent>(`/events/${id}`, { params: { lang: lang() } })

export const getCategories = (signal?: AbortSignal) => request<ApiPage<Category>>('/categories', signal ? { signal } : {})

export const getPerformances = async (id: number, signal?: AbortSignal) => {
  const items: Performance[] = []
  let page = 1
  let total = 0
  do {
    const result = await request<ApiPage<Performance>>(`/events/${id}/performances`, {
      params: {
        page,
        pageSize: 100,
        lang: lang(),
      },
      ...(signal ? { signal } : {}),
    })
    items.push(...result.items)
    total = result.total
    page++
    if (!result.items.length) break
  } while (items.length < total)
  return items
}
