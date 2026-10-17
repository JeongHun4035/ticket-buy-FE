import i18n from '@/i18n'

import { request } from './client'

import type { ApiContent, ApiEvent, ApiPage, ApiSeat, ApiUser, Category, ContentInput, EventQuery, Performance, QueueEntry, Reservation, SeatHold, SupportInfo } from '@/types/interfaces/api/ticket'

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
export const joinQueue = (id: number) => request<QueueEntry>(`/performances/${id}/queue`, { method: 'POST' }, true)
export const getQueue = (id: number, signal?: AbortSignal) => request<QueueEntry>(`/performances/${id}/queue/me`, signal ? { signal } : {}, true)
export const leaveQueue = (id: number) => request<void>(`/performances/${id}/queue/me`, { method: 'DELETE' }, true)
export const getSeats = (id: number, token: string, signal?: AbortSignal) => request<ApiPage<ApiSeat>>(`/performances/${id}/seats`, {
  headers: { 'X-Admission-Token': token },
  ...(signal ? { signal } : {}),
}, true)
export const createHold = (id: number, token: string, seatIds: string[]) => request<SeatHold>(`/performances/${id}/holds`, {
  method: 'POST',
  headers: { 'X-Admission-Token': token },
  body: { seatIds: seatIds.map(Number) },
}, true)
export const releaseHold = (id: string) => request<void>(`/holds/${encodeURIComponent(id)}`, { method: 'DELETE' }, true)
export const createReservation = (holdId: string, token: string, key: string) => request<Reservation>('/reservations', {
  method: 'POST',
  headers: {
    'X-Admission-Token': token,
    'Idempotency-Key': key,
  },
  body: { holdId },
}, true)
export const getReservations = (page: number, pageSize: number, signal?: AbortSignal) => request<ApiPage<Reservation>>('/reservations/me', {
  params: {
    page,
    pageSize,
  },
  ...(signal ? { signal } : {}),
}, true)
export const getReservation = (id: string) => request<Reservation>(`/reservations/${encodeURIComponent(id)}`, {}, true)
export const cancelReservation = (id: string) => request<Reservation>(`/reservations/${encodeURIComponent(id)}/cancel`, { method: 'POST' }, true)
export const getCurrentUser = () => request<ApiUser>('/users/me', {}, true)
export const getSupportInfo = (signal?: AbortSignal) => request<SupportInfo>('/support/info', signal ? { signal } : {})
export const getContents = (kind: 'posts' | 'faqs', q: string, page: number, pageSize: number, signal?: AbortSignal, language = lang()) => request<ApiPage<ApiContent>>(`/${kind}`, {
  params: {
    q,
    page,
    pageSize,
    lang: language,
  },
  ...(signal ? { signal } : {}),
})
export const getPost = (id: number) => request<ApiContent>(`/posts/${id}`, { params: { lang: lang() } })
export const saveContent = (kind: 'posts' | 'faqs', input: ContentInput, id?: number) => request<ApiContent>(`/admin/${kind}${id ? `/${id}` : ''}`, {
  method: id ? 'PATCH' : 'POST',
  body: input,
}, true)
export const deleteContent = (kind: 'posts' | 'faqs', id: number) => request<void>(`/admin/${kind}/${id}`, { method: 'DELETE' }, true)

export const getContentInput = async (kind: 'posts' | 'faqs', id: number): Promise<ContentInput> => {
  const input: ContentInput = {
    category: 'NOTICE',
    titles: {},
    bodies: {},
  }
  for (const language of [
    'ko',
    'en',
    'zh-CN',
  ]) {
    let item: ApiContent | undefined
    if (kind === 'posts') item = await request<ApiContent>(`/posts/${id}`, { params: { lang: language } })
    else {
      let page = 1
      let result: ApiPage<ApiContent>
      do {
        result = await request<ApiPage<ApiContent>>('/faqs', {
          params: {
            page,
            pageSize: 100,
            lang: language,
          },
        })
        item = result.items.find(entry => entry.id === id)
        page++
      } while (!item && result.items.length > 0 && (page - 1) * 100 < result.total)
    }
    if (!item) throw new Error('콘텐츠를 찾을 수 없습니다.')
    if (item.category === 'NOTICE' || item.category === 'GUIDE' || item.category === 'UPDATE') input.category = item.category
    input.titles[language] = item.title
    input.bodies[language] = item.content
  }
  return input
}
