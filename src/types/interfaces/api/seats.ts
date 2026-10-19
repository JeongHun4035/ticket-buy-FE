import type { ApiPage } from './common'

export interface ApiSeat {
  id: string,
  row: string,
  number: number,
  x: number,
  y: number,
  grade: 'VIP' | 'R' | 'S',
  price: number,
  status: 'AVAILABLE' | 'HELD' | 'RESERVED',
}

export interface SeatPage extends ApiPage<ApiSeat> {
  availableSeats: number,
}

export interface SeatHold {
  id: string,
  performanceId: number,
  expiresAt: string,
  status: 'ACTIVE',
  seats: ApiSeat[],
  total: number,
  currency: string,
}
