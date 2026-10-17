export interface TicketEvent {
  id: number,
  title: string,
  category: string,
  venue: string,
  date: string,
  price: number,
  art: string,
  headline: string,
  status: '예매중' | '오픈예정' | '마감',
  description?: string,
  posterUrl?: string | null,
}

export interface EventPosterProps {
  event: TicketEvent,
}
