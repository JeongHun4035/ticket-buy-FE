import i18n from '@/i18n'

import { reportApiError } from './errorNavigation'
import { fetchRequest } from './fetch'
import { ApiError } from './http'

import type { RequestOptions } from './http'
import type { SignUpRequest } from '@/types/interfaces/api/auth'
import type { ApiUser, AuthSession } from '@/types/interfaces/api/users'

let accessToken: string | null = null
let refreshing: Promise<AuthSession> | null = null
const sessionKey = 'ticket-buy-authenticated'
// 로그인 이력 표시만 저장합니다. 토큰 및 인증 여부의 최종 판단은 서버에서 관리합니다.
export const hasKnownSession = () => {
  if (accessToken) return true
  try {
    return localStorage.getItem(sessionKey) === 'true'
  } catch {
    return false
  }
}
const listeners = new Set<(session: AuthSession | null) => void>()

export const subscribeSession = (listener: (session: AuthSession | null) => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const updateSession = (session: AuthSession | null) => {
  accessToken = session?.accessToken ?? null
  try {
    if (session) localStorage.setItem(sessionKey, 'true')
    else localStorage.removeItem(sessionKey)
  } catch { /* Authentication still works without optional storage. */ }
  listeners.forEach(listener => listener(session))
}
export const refreshSession = () => {
  if (!hasKnownSession()) return Promise.reject(new ApiError(401, {
    code: 'AUTHENTICATION_REQUIRED',
    message: '로그인이 필요합니다.',
  }))
  refreshing ??= fetchRequest<AuthSession>('/api/v1/auth/refresh', { method: 'POST' }).then(session => {
    updateSession(session)
    return session
  })
    .catch((error: unknown) => {
      updateSession(null)
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}
const authenticatedRequest = async <T = unknown>(path: string, options: RequestOptions = {}, authenticated = false): Promise<T> => {
  const run = () => fetchRequest<T>(`/api/v1${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })
  try {
    return await run()
  } catch (error) {
    if (options.retryAuth !== false && hasKnownSession() && !path.startsWith('/auth/') && (authenticated || !!accessToken) && error instanceof ApiError && error.status === 401) {
      await refreshSession()
      return run()
    }
    throw error
  }
}
export const request = async <T = unknown>(path: string, options: RequestOptions = {}, authenticated = false): Promise<T> => {
  try {
    return await authenticatedRequest<T>(path, options, authenticated)
  } catch (error) {
    if (!options.signal?.aborted) reportApiError(error)
    throw error
  }
}

export const login = async (username: string, password: string) => {
  const session = await request<AuthSession>('/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  })
  updateSession(session)
  return session
}
export const logout = async () => {
  await request('/auth/logout', { method: 'POST' })
  updateSession(null)
}
export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data && typeof error.data.message === 'string') {
    const code = 'code' in error.data && typeof error.data.code === 'string' ? error.data.code : ''
    return `${i18n.exists(code) ? i18n.t(code) : error.data.message}${code ? ` (${code})` : ''}`
  }
  return error instanceof Error ? error.message : '요청을 처리하지 못했습니다.'
}

export const signUp = (input: SignUpRequest) => request<ApiUser>('/auth/signup', {
  method: 'POST',
  body: input,
})
