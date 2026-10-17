import { request } from './client'

import type { AdminVenue, AdminVenueLayout, EventCreated, EventCreateInput } from '@/types/interfaces/api/adminEvents'
import type { ApiPage } from '@/types/interfaces/api/ticket'

export const getAdminVenues = (page: number, pageSize: number, signal: AbortSignal) => request<ApiPage<AdminVenue>>('/admin/venues', {
  params: {
    page,
    pageSize,
  },
  signal,
}, true)
export const getAdminVenueLayout = (id: number, signal: AbortSignal) => request<AdminVenueLayout>('/admin/venues/' + id + '/sections', { signal }, true)
export const createAdminEvent = (payload: EventCreateInput, image: File) => {
  const form = new FormData()
  form.append('event', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  form.append('image', image)
  // No automatic replay: a lost response must not create another event.
  return request<EventCreated>('/admin/events', {
    method: 'POST',
    body: form,
    timeout: 120000,
    retryAuth: false,
  }, true)
}
