export interface ReservationSeat {
  id: string,
  row: string,
  number: number,
  grade: 'VIP' | 'R' | 'S',
  price: number,
}

export interface Reservation {
  id: string,
  performanceId: number,
  status: 'CONFIRMED' | 'CANCELLED',
  paymentStatus: 'NOT_REQUIRED',
  total: number,
  currency: string,
  createdAt: string,
  seats: ReservationSeat[],
}
