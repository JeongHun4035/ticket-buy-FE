export interface ApiPage<T> {
  items: T[],
  total: number,
  page: number,
  pageSize: number,
}
export interface ApiUser {
  id: string,
  name: string,
  role: string,
}
export interface AuthSession {
  accessToken: string,
  expiresAt: string,
  tokenType: string,
  user: ApiUser,
}
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
export interface QueueEntry {
  state: 'WAITING' | 'ADMITTED' | 'EXPIRED' | 'CANCELLED',
  ticketNumber: number,
  aheadCount: number,
  estimatedWaitSeconds: number | null,
  admissionToken: string | null,
  admissionExpiresAt: string | null,
  pollAfterSeconds: number,
}
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
export interface SeatHold {
  id: string,
  performanceId: number,
  expiresAt: string,
  status: 'ACTIVE',
  seats: ApiSeat[],
  total: number,
  currency: string,
}
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
export interface ApiContent {
  id: number,
  category: string,
  title: string,
  content: string,
  date: string,
}
export interface ContentInput {
  category: 'NOTICE' | 'GUIDE' | 'UPDATE',
  titles: Record<string, string>,
  bodies: Record<string, string>,
}
export interface SupportInfo {
  serviceName: string,
  phone: string | null,
  email: string | null,
  timezone: string,
  message: string,
}
export interface EventQuery {
  q: string,
  category: string,
  sort: string,
  page: number,
  pageSize: number,
}
export interface QueryState<T> {
  data: T | null,
  loading: boolean,
  error: string,
}
