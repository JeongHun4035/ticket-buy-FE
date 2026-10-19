import { retryDelay } from '@/utils/retryDelay'

import { request } from './client'
import { ApiError } from './http'

import type { SeatHold, SeatPage } from '@/types/interfaces/api/seats'

const requestSeats = (path: string, token: string, signal?: AbortSignal) => request<SeatPage>(path, {
  headers: { 'X-Admission-Token': token },
  ...(signal ? { signal } : {}),
}, true)

const getSeatPage = async (path: string, token: string, signal?: AbortSignal): Promise<SeatPage> => {
  try {
    return await requestSeats(path, token, signal)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 429) throw error
    await retryDelay(Math.max(1, error.retryAfterSeconds ?? 2) * 1000, signal)
    return requestSeats(path, token, signal)
  }
}

export const getSeats = (id: number, token: string, signal?: AbortSignal) => getSeatPage(`/performances/${id}/seats`, token, signal)

export const getSectionSeats = (id: number, sectionId: string | number, token: string, signal?: AbortSignal) => getSeatPage(`/performances/${id}/sections/${encodeURIComponent(sectionId)}/seats`, token, signal)

export const createHold = (id: number, token: string, seatIds: string[]) => request<SeatHold>(`/performances/${id}/holds`, {
  method: 'POST',
  headers: { 'X-Admission-Token': token },
  body: { seatIds: seatIds.map(Number) },
}, true)

export const releaseHold = (id: string) => request<void>(`/holds/${encodeURIComponent(id)}`, { method: 'DELETE' }, true)
