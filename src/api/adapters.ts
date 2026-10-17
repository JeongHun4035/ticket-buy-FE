import type { ApiEvent } from '@/types/interfaces/api/ticket'
import type { TicketEvent } from '@/types/interfaces/pages/main'

export const toTicketEvent = (event: ApiEvent): TicketEvent => ({
  id: event.id,
  title: event.title,
  venue: event.venue,
  date: event.date,
  price: event.price,
  description: event.description,
  posterUrl: event.posterUrl,
  category: ({
    CONCERT: '콘서트',
    MUSICAL: '뮤지컬',
    THEATER: '연극',
    EXHIBITION: '전시',
    CLASSICAL: '클래식',
  } as Record<string, string>)[event.category] ?? event.category,
  art: ({
    CONCERT: 'forest',
    MUSICAL: 'paris',
    THEATER: 'season',
    EXHIBITION: 'light',
    CLASSICAL: 'classic',
  } as Record<string, string>)[event.category] ?? 'forest',
  headline: event.title,
  status: event.status === 'ON_SALE' ? '예매중' : event.status === 'UPCOMING' ? '오픈예정' : '마감',
})
export const formatDate = (date: string, language = 'ko') => {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(value)
}

export const formatDateOnly = (date: string) => {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return date
  const parts = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).formatToParts(value)
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  return [
    part('year'),
    part('month'),
    part('day'),
  ].join('-')
}
