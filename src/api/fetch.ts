import { ApiError, apiConfig, getRequestURL } from './http'

import type { RequestOptions } from './http'

/** JSON 또는 텍스트 응답 본문을 반환하며, 빈 응답은 undefined를 반환합니다. */
export async function fetchRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const controller = new AbortController()
  const timeout = options.timeout ?? apiConfig.timeout
  const timer = timeout > 0 ? setTimeout(() => controller.abort(new DOMException('요청 시간이 초과되었습니다.', 'TimeoutError')), timeout) : undefined
  const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal

  try {
    const response = await fetch(getRequestURL(path, options.params), {
      method: options.method ?? 'GET',
      headers,
      signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
    const text = await response.text()
    let data: unknown = text || undefined
    if (text && response.headers.get('Content-Type')?.includes('json')) {
      try {
        data = JSON.parse(text) as unknown
      } catch (error) {
        if (response.ok) throw error
      }
    }
    if (!response.ok) throw new ApiError(response.status, data)
    return data as T
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}
