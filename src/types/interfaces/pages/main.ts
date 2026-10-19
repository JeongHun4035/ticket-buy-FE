import type { RefObject } from 'react'

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

export interface EventDetailProps {
  selected: TicketEvent | null,
  dialog: RefObject<HTMLDialogElement | null>,
  onClose: () => void,
  onBook: (event: TicketEvent) => void,
}
