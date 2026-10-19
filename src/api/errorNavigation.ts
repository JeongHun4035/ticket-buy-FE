import { ApiError } from './http'

export const API_ERROR_EVENT = 'ticket-buy:api-error'
export interface ErrorPageState {
  from: string,
  retryAt: number,
}
export const reportApiError = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'AbortError') return
  const status = error instanceof ApiError ? error.status : error instanceof DOMException && error.name === 'TimeoutError' ? 408 : 0
  const seconds = error instanceof ApiError ? error.retryAfterSeconds ?? 0 : 0
  window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, {
    detail: {
      status,
      retryAt: Date.now() + seconds * 1000,
    },
  }))
}
