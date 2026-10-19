import { request } from './client'

import type { QueueEntry } from '@/types/interfaces/api/queue'

export const joinQueue = (id: number) => request<QueueEntry>(`/performances/${id}/queue`, { method: 'POST' }, true)

export const getQueue = (id: number, signal?: AbortSignal) => request<QueueEntry>(`/performances/${id}/queue/me`, signal ? { signal } : {}, true)

export const leaveQueue = (id: number) => request<void>(`/performances/${id}/queue/me`, { method: 'DELETE' }, true)
