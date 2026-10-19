export interface ApiEvent {
  id: number,
  title: string,
  description: string,
  category: string,
  venue: string,
  date: string,
  price: number,
  posterUrl: string | null,
  status: 'ON_SALE' | 'UPCOMING' | 'CLOSED',
}

export interface Category {
  code: string,
  names: Record<string, string>,
}

export interface Performance {
  id: number,
  eventId: number,
  venueId: number,
  venue: string,
  startsAt: string,
  opensAt: string,
  closesAt: string,
  status: 'ON_SALE' | 'UPCOMING' | 'CLOSED',
}

export interface EventQuery {
  q: string,
  category: string,
  sort: string,
  page: number,
  pageSize: number,
}
