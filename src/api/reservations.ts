import { request } from './client'

import type { ApiPage } from '@/types/interfaces/api/common'
import type { Reservation } from '@/types/interfaces/api/reservations'

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
