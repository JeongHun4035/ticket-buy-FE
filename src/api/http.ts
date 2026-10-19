import type { RequestOptions } from '@/types/interfaces/api/http'

export type { RequestOptions } from '@/types/interfaces/api/http'

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000,
}

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown
  readonly retryAfterSeconds: number | null

  constructor(status: number, data: unknown, headers?: Headers) {
    super(`API 요청에 실패했습니다. (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    const retry = headers?.get('Retry-After')
    const seconds = retry ? (/^\d+$/.test(retry) ? Number(retry) : Math.ceil((Date.parse(retry) - Date.now()) / 1000)) : NaN
    this.retryAfterSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : null
  }
}

export function getRequestURL(path: string, params?: RequestOptions['params']): string {
  const target = /^https?:\/\//i.test(path) ?
    path :
    `${apiConfig.baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const url = new URL(target, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }
  return url.toString()
}
