import type { ApiEvent } from '@/types/interfaces/api/events'
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
export { formatDate, formatDateOnly } from '@/utils/dateTime'
